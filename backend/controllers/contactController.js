import validator from "validator";
import contactModel from "../models/contactModel.js";
import { isId } from "../utils/appointments.js";
import { fail, serverError } from "../utils/respond.js";

// Submit a contact message (public, rate-limited in the route)
const submitContact = async (req, res) => {
  try {
    let { name, email, subject, message } = req.body;
    if ([name, email, subject, message].some((v) => typeof v !== "string" || !v.trim())) {
      return fail(res, "All fields are required");
    }
    name = name.trim();
    email = email.trim().toLowerCase();
    subject = subject.trim();
    message = message.trim();

    if (!validator.isEmail(email)) return fail(res, "Invalid email");
    if (name.length > 100 || subject.length > 200 || message.length > 3000) {
      return fail(res, "One of the fields is too long");
    }

    await new contactModel({ name, email, subject, message, date: Date.now() }).save();
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    serverError(res, error, "submitContact");
  }
};

// Get all contact messages (admin only)
const getContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find({}).sort({ date: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    serverError(res, error, "getContacts");
  }
};

// Mark message as read (admin only)
const markRead = async (req, res) => {
  try {
    const { contactId } = req.body;
    if (!isId(contactId)) return fail(res, "Invalid message");
    await contactModel.findByIdAndUpdate(contactId, { read: true });
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    serverError(res, error, "markRead");
  }
};

// Delete message (admin only)
const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    if (!isId(contactId)) return fail(res, "Invalid message");
    await contactModel.findByIdAndDelete(contactId);
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    serverError(res, error, "deleteContact");
  }
};

export { submitContact, getContacts, markRead, deleteContact };
