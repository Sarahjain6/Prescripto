import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { isId, cancelAppointmentAtomic } from "../utils/appointments.js";
import { fail, serverError } from "../utils/respond.js";

// DOCTOR LOGIN
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return fail(res, "Missing details");
    }
    const doctor = await doctorModel.findOne({ email });
    // one generic message: don't reveal whether the email exists
    const isMatch = doctor ? await bcrypt.compare(password, doctor.password) : false;
    if (!isMatch) return fail(res, "Invalid email or password");

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    serverError(res, error, "loginDoctor");
  }
};

// GET DOCTOR APPOINTMENTS
const appointmentsDoctor = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ docId: req.docId });
    res.json({ success: true, appointments });
  } catch (error) {
    serverError(res, error, "appointmentsDoctor");
  }
};

// MARK APPOINTMENT COMPLETE (own appointments only; not if cancelled or already done)
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!isId(appointmentId)) return fail(res, "Mark Failed");
    const done = await appointmentModel.findOneAndUpdate(
      { _id: appointmentId, docId: req.docId, cancelled: false, isCompleted: false },
      { isCompleted: true }
    );
    if (!done) return fail(res, "Mark Failed");
    res.json({ success: true, message: "Appointment completed" });
  } catch (error) {
    serverError(res, error, "appointmentComplete");
  }
};

// CANCEL APPOINTMENT BY DOCTOR (now also frees the slot - it used to stay blocked forever)
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!isId(appointmentId)) return fail(res, "Cancellation Failed");
    const cancelled = await cancelAppointmentAtomic({ _id: appointmentId, docId: req.docId });
    if (!cancelled) return fail(res, "Cancellation Failed");
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    serverError(res, error, "doctor appointmentCancel");
  }
};

// GET DOCTOR PROFILE
const doctorProfile = async (req, res) => {
  try {
    const profileData = await doctorModel.findById(req.docId).select("-password");
    if (!profileData) return res.json({ success: false, message: "Not Authorized", tokenExpired: true });
    res.json({ success: true, profileData });
  } catch (error) {
    serverError(res, error, "doctorProfile");
  }
};

// UPDATE DOCTOR PROFILE (validated; only fields actually sent are changed)
const updateDoctorProfile = async (req, res) => {
  try {
    const { fees, address, available, about } = req.body;
    const update = {};

    if (fees !== undefined) {
      const f = Number(fees);
      if (!Number.isFinite(f) || f <= 0 || f > 1000000) return fail(res, "Invalid fees");
      update.fees = f;
    }
    if (address !== undefined) {
      if (typeof address !== "object" || address === null) return fail(res, "Invalid address");
      update.address = {
        line1: String(address.line1 ?? "").slice(0, 200),
        line2: String(address.line2 ?? "").slice(0, 200),
      };
    }
    if (available !== undefined) {
      if (typeof available !== "boolean") return fail(res, "Invalid availability");
      update.available = available;
    }
    if (about !== undefined) {
      if (typeof about !== "string" || !about.trim() || about.length > 2000) return fail(res, "Invalid about text");
      update.about = about.trim();
    }
    if (Object.keys(update).length === 0) return fail(res, "Nothing to update");

    await doctorModel.findByIdAndUpdate(req.docId, update);
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    serverError(res, error, "updateDoctorProfile");
  }
};

// GET DOCTOR DASHBOARD DATA (computed in the database, not in Node memory)
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req;
    const [earningsAgg, appointments, patientIds, latestAppointments] = await Promise.all([
      appointmentModel.aggregate([
        { $match: { docId, $or: [{ isCompleted: true }, { payment: true }] } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      appointmentModel.countDocuments({ docId }),
      appointmentModel.distinct("userId", { docId }),
      appointmentModel.find({ docId }).sort({ date: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      dashData: {
        earnings: earningsAgg[0]?.total || 0,
        appointments,
        patients: patientIds.length,
        latestAppointments,
      },
    });
  } catch (error) {
    serverError(res, error, "doctorDashboard");
  }
};

// GET ALL DOCTORS (public)
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ available: true }).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    serverError(res, error, "doctorList");
  }
};

export { loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorProfile, updateDoctorProfile, doctorDashboard, doctorList };
