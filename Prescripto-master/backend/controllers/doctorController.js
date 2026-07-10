import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// DOCTOR LOGIN
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET DOCTOR APPOINTMENTS
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req;
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// MARK APPOINTMENT COMPLETE
const appointmentComplete = async (req, res) => {
  try {
    const { docId } = req;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.json({ success: true, message: "Appointment completed" });
    }
    res.json({ success: false, message: "Mark Failed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// CANCEL APPOINTMENT BY DOCTOR
const appointmentCancel = async (req, res) => {
  try {
    const { docId } = req;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.json({ success: true, message: "Appointment cancelled" });
    }
    res.json({ success: false, message: "Cancellation Failed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET DOCTOR PROFILE
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// UPDATE DOCTOR PROFILE
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId } = req;
    const { fees, address, available, about } = req.body;
    await doctorModel.findByIdAndUpdate(docId, { fees, address, available, about });
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET DOCTOR DASHBOARD DATA
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req;
    const appointments = await appointmentModel.find({ docId });
    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) earnings += item.amount;
    });
    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) patients.push(item.userId);
    });
    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET ALL DOCTORS (public)
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ available: true }).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorProfile, updateDoctorProfile, doctorDashboard, doctorList };
