import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Stripe from "stripe";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: "Missing details" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" });
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.json({ success: false, message: "Email already registered" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const { userId } = req;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;
    if (!name || !phone || !dob || !gender) return res.json({ success: false, message: "Missing details" });
    const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
    await userModel.findByIdAndUpdate(userId, { name, phone, address: parsedAddress, dob, gender });
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url });
    }
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// BOOK APPOINTMENT
const bookAppointment = async (req, res) => {
  try {
    const { userId } = req;
    const { docId, slotDate, slotTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) return res.json({ success: false, message: "Doctor not available" });
    let slots_booked = docData.slots_booked;
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) return res.json({ success: false, message: "Slot not available" });
      slots_booked[slotDate].push(slotTime);
    } else {
      slots_booked[slotDate] = [slotTime];
    }
    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;
    const newAppointment = new appointmentModel({
      userId, docId, userData, docData,
      amount: docData.fees, slotTime, slotDate, date: Date.now(),
    });
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment booked" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LIST APPOINTMENTS
const listAppointment = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ userId: req.userId });
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
  try {
    const { userId } = req;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData.userId !== userId) return res.json({ success: false, message: "Unauthorized" });
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── STRIPE PAYMENT ───────────────────────────────────────

// Create Stripe checkout session
const paymentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const origin = req.headers.origin || "https://prescripto-odgm.vercel.app";
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment not found or cancelled" });
    }
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: {
            name: `Appointment with ${appointmentData.docData?.name}`,
            description: `${appointmentData.docData?.speciality} · ${appointmentData.slotDate?.replace(/_/g, "/")} at ${appointmentData.slotTime}`,
          },
          unit_amount: appointmentData.amount * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/my-appointments?payment=success&appointmentId=${appointmentId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-appointments?payment=cancel`,
      metadata: { appointmentId },
    });
    res.json({ success: true, session_url: session.url, sessionId: session.id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe payment
const verifyStripe = async (req, res) => {
  try {
    const { sessionId, appointmentId } = req.body;
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
        paymentMethod: "stripe",
      });
      res.json({ success: true, message: "Payment verified" });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser, loginUser, getProfile, updateProfile,
  bookAppointment, listAppointment, cancelAppointment,
  paymentStripe, verifyStripe,
};