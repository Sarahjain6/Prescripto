import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";
import Razorpay from "razorpay";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { validateSlot } from "../utils/slots.js";
import { isId, releaseSlot, cancelAppointmentAtomic } from "../utils/appointments.js";
import { safeEqual } from "../utils/security.js";
import { removeFile } from "../utils/files.js";
import { fail, serverError } from "../utils/respond.js";

// Created lazily: Razorpay's constructor throws if keys are missing, which used
// to crash the whole server at startup even though payments are optional.
let razorpayInstance = null;
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

const GENDERS = ["Not Selected", "Male", "Female", "Other"];

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return fail(res, "Missing details");
    }
    name = name.trim();
    email = email.trim().toLowerCase();

    if (!name || !email || !password) return fail(res, "Missing details");
    if (name.length > 100) return fail(res, "Name is too long");
    if (!validator.isEmail(email)) return fail(res, "Invalid email");
    // bcrypt only uses the first 72 bytes, so cap the length
    if (password.length < 8 || password.length > 72) return fail(res, "Password must be 8 to 72 characters");

    const existingUser = await userModel.findOne({ email });
    if (existingUser) return fail(res, "Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new userModel({ name, email, password: hashedPassword }).save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    // two simultaneous signups with the same email
    if (error.code === 11000) return fail(res, "Email already registered");
    if (error.name === "ValidationError") {
      return fail(res, Object.values(error.errors)[0]?.message || "Invalid details");
    }
    serverError(res, error, "register");
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return fail(res, "Missing details");
    }
    email = email.trim().toLowerCase();

    const user = await userModel.findOne({ email });
    // Same message for "no such user" and "wrong password" so attackers can't
    // use the login form to discover which emails are registered.
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) return fail(res, "Invalid email or password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    serverError(res, error, "login");
  }
};

// GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");
    if (!userData) return res.json({ success: false, message: "Not Authorized", tokenExpired: true });
    res.json({ success: true, userData });
  } catch (error) {
    serverError(res, error, "getProfile");
  }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  const imageFile = req.file;
  try {
    const { userId } = req;
    let { name, phone, address, dob, gender } = req.body;

    if (!name || !phone || !dob || !gender) return fail(res, "Missing details");
    if ([name, phone, dob, gender].some((v) => typeof v !== "string")) return fail(res, "Invalid details");
    name = name.trim();
    phone = phone.trim();
    if (!name || name.length > 100) return fail(res, "Invalid name");
    if (phone.length > 20) return fail(res, "Invalid phone number");
    if (!GENDERS.includes(gender)) return fail(res, "Invalid gender");
    if (dob !== "Not Selected" && !validator.isDate(dob, { format: "YYYY-MM-DD", strictMode: true })) {
      return fail(res, "Invalid date of birth");
    }

    let parsedAddress = { line1: "", line2: "" };
    if (address) {
      let raw;
      try {
        raw = typeof address === "string" ? JSON.parse(address) : address;
      } catch {
        return fail(res, "Invalid address");
      }
      parsedAddress = {
        line1: String(raw?.line1 ?? "").slice(0, 200),
        line2: String(raw?.line2 ?? "").slice(0, 200),
      };
    }

    const update = { name, phone, address: parsedAddress, dob, gender };
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      update.image = imageUpload.secure_url;
    }
    await userModel.findByIdAndUpdate(userId, update);
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    serverError(res, error, "updateProfile");
  } finally {
    await removeFile(imageFile);
  }
};

// BOOK APPOINTMENT
const bookAppointment = async (req, res) => {
  try {
    const { userId } = req;
    const { docId, slotDate, slotTime } = req.body;

    if (!isId(docId)) return fail(res, "Invalid doctor");
    const check = validateSlot(slotDate, slotTime);
    if (!check.ok) return fail(res, check.message);

    const userData = await userModel.findById(userId).select("-password").lean();
    if (!userData) return fail(res, "User not found");

    // Reserve the slot ATOMICALLY: the update only matches if the doctor is
    // available AND the slot isn't already taken. Two simultaneous requests can
    // no longer both succeed (the old read-then-write allowed double booking).
    const slotPath = `slots_booked.${slotDate}`;
    const docData = await doctorModel
      .findOneAndUpdate(
        { _id: docId, available: true, [slotPath]: { $ne: slotTime } },
        { $push: { [slotPath]: slotTime } },
        { new: true }
      )
      // snapshot stored on the appointment: no password, no email, no other patients' slots
      .select("-password -email -slots_booked")
      .lean();

    if (!docData) {
      const doctor = await doctorModel.findById(docId).select("available").lean();
      if (!doctor) return fail(res, "Doctor not found");
      if (!doctor.available) return fail(res, "Doctor not available");
      return fail(res, "Slot not available");
    }

    try {
      await new appointmentModel({
        userId, docId, userData, docData,
        amount: docData.fees, slotTime, slotDate, date: Date.now(),
      }).save();
    } catch (saveError) {
      // don't leave the slot locked if the appointment couldn't be stored
      await releaseSlot({ docId, slotDate, slotTime }).catch(() => {});
      throw saveError;
    }

    res.json({ success: true, message: "Appointment booked" });
  } catch (error) {
    serverError(res, error, "bookAppointment");
  }
};

// LIST APPOINTMENTS
const listAppointment = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ userId: req.userId });
    res.json({ success: true, appointments });
  } catch (error) {
    serverError(res, error, "listAppointment");
  }
};

// CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!isId(appointmentId)) return fail(res, "Invalid appointment");

    const cancelled = await cancelAppointmentAtomic({ _id: appointmentId, userId: req.userId });
    if (!cancelled) return fail(res, "Appointment not found, already cancelled, or already completed");
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    serverError(res, error, "cancelAppointment");
  }
};

// ─── RAZORPAY PAYMENT ───────────────────────────────────────

// Create (or reuse) a Razorpay order for the user's own unpaid appointment
const paymentRazorpay = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return fail(res, "Online payments are not configured");

    const { appointmentId } = req.body;
    if (!isId(appointmentId)) return fail(res, "Invalid appointment");

    // userId in the filter => you can only pay for YOUR appointment
    const appointment = await appointmentModel.findOne({ _id: appointmentId, userId: req.userId });
    if (!appointment || appointment.cancelled) return fail(res, "Appointment not found or cancelled");
    if (appointment.payment) return fail(res, "This appointment is already paid");

    // Reuse an unpaid order instead of creating a new one on every click.
    // (Overwriting the stored order id could orphan a payment the user is
    // completing in another tab.)
    if (appointment.razorpay_order_id) {
      try {
        const existing = await razorpay.orders.fetch(appointment.razorpay_order_id);
        if (existing && existing.status !== "paid") return res.json({ success: true, order: existing });
      } catch {
        /* order not found on Razorpay - fall through and create a new one */
      }
    }

    const order = await razorpay.orders.create({
      amount: Math.round(appointment.amount * 100), // paise
      currency: process.env.CURRENCY || "INR",
      receipt: String(appointment._id),
    });
    await appointmentModel.updateOne({ _id: appointment._id }, { razorpay_order_id: order.id });
    res.json({ success: true, order });
  } catch (error) {
    serverError(res, error, "paymentRazorpay");
  }
};

// Verify Razorpay payment
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((v) => typeof v === "string" && v)) {
      return fail(res, "Payment verification failed");
    }
    if (!isId(appointmentId)) return fail(res, "Invalid appointment");
    if (!process.env.RAZORPAY_KEY_SECRET) return fail(res, "Online payments are not configured");

    const appointment = await appointmentModel.findOne({ _id: appointmentId, userId: req.userId });
    if (!appointment || appointment.cancelled) return fail(res, "Appointment not found or cancelled");
    if (appointment.payment) return res.json({ success: true, message: "Payment already verified" });

    // The order being verified must be the one WE created for THIS appointment,
    // otherwise someone could present a cheap payment as proof for a pricier visit.
    if (!appointment.razorpay_order_id || appointment.razorpay_order_id !== razorpay_order_id) {
      return fail(res, "Payment verification failed");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeEqual(expectedSignature, razorpay_signature)) {
      return fail(res, "Payment verification failed");
    }

    await appointmentModel.updateOne(
      { _id: appointmentId, payment: false },
      { payment: true, paymentMethod: "razorpay", razorpay_order_id, razorpay_payment_id }
    );
    res.json({ success: true, message: "Payment verified" });
  } catch (error) {
    serverError(res, error, "verifyRazorpay");
  }
};

export {
  registerUser, loginUser, getProfile, updateProfile,
  bookAppointment, listAppointment, cancelAppointment,
  paymentRazorpay, verifyRazorpay,
};
