import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import { isId, cancelAppointmentAtomic } from "../utils/appointments.js";
import { safeEqual } from "../utils/security.js";
import { removeFile } from "../utils/files.js";
import { fail, serverError } from "../utils/respond.js";

const SPECIALITIES = ["General physician", "Gynecologist", "Dermatologist", "Pediatricians", "Neurologist", "Gastroenterologist"];

// ADD DOCTOR
const addDoctor = async (req, res) => {
  const imageFile = req.file;
  try {
    let { name, email, password, speciality, degree, experience, about, fees, address } = req.body;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
      return fail(res, "Missing details");
    }
    if ([name, email, password, speciality, degree, experience, about].some((v) => typeof v !== "string")) {
      return fail(res, "Invalid details");
    }
    email = email.trim().toLowerCase();
    if (!validator.isEmail(email)) return fail(res, "Invalid email");
    if (password.length < 8 || password.length > 72) return fail(res, "Password must be 8 to 72 characters");
    if (!SPECIALITIES.includes(speciality)) return fail(res, "Invalid speciality");
    const feesNumber = Number(fees);
    if (!Number.isFinite(feesNumber) || feesNumber <= 0 || feesNumber > 1000000) return fail(res, "Invalid fees");

    let rawAddress;
    try {
      rawAddress = typeof address === "string" ? JSON.parse(address) : address;
    } catch {
      return fail(res, "Invalid address");
    }
    const parsedAddress = {
      line1: String(rawAddress?.line1 ?? "").slice(0, 200),
      line2: String(rawAddress?.line2 ?? "").slice(0, 200),
    };

    if (await doctorModel.findOne({ email })) return fail(res, "A doctor with this email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

    await new doctorModel({
      name: name.trim(), email,
      image: imageUpload.secure_url,
      password: hashedPassword,
      speciality, degree, experience, about,
      fees: feesNumber,
      address: parsedAddress,
      date: Date.now(),
    }).save();
    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    if (error.code === 11000) return fail(res, "A doctor with this email already exists");
    serverError(res, error, "addDoctor");
  } finally {
    await removeFile(imageFile);
  }
};

// ADMIN LOGIN (constant-time comparison)
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // evaluate both before branching so timing doesn't reveal which one was right
    const emailOk = safeEqual(email, process.env.ADMIN_EMAIL);
    const passOk = safeEqual(password, process.env.ADMIN_PASSWORD);
    if (typeof email !== "string" || typeof password !== "string" || !(emailOk && passOk)) {
      return fail(res, "Invalid credentials");
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    serverError(res, error, "loginAdmin");
  }
};

// GET ALL DOCTORS
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    serverError(res, error, "allDoctors");
  }
};

// GET ALL APPOINTMENTS
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    serverError(res, error, "appointmentsAdmin");
  }
};

// CANCEL APPOINTMENT (cancels once, frees the slot once)
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!isId(appointmentId)) return fail(res, "Invalid appointment");
    const cancelled = await cancelAppointmentAtomic({ _id: appointmentId });
    if (!cancelled) return fail(res, "Appointment not found, already cancelled, or already completed");
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    serverError(res, error, "admin appointmentCancel");
  }
};

// ADMIN DASHBOARD DATA - counts + only the 5 newest rows, instead of loading
// every user and every appointment into memory
const adminDashboard = async (req, res) => {
  try {
    const [doctors, patients, appointments, latestAppointments] = await Promise.all([
      doctorModel.countDocuments({}),
      userModel.countDocuments({}),
      appointmentModel.countDocuments({}),
      appointmentModel.find({}).sort({ date: -1 }).limit(5),
    ]);
    res.json({ success: true, dashData: { doctors, patients, appointments, latestAppointments } });
  } catch (error) {
    serverError(res, error, "adminDashboard");
  }
};

// UPDATE DOCTOR AVAILABILITY
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    if (!isId(docId)) return fail(res, "Invalid doctor");
    const docData = await doctorModel.findById(docId).select("available");
    if (!docData) return fail(res, "Doctor not found");
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    serverError(res, error, "changeAvailability");
  }
};

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, changeAvailability };
