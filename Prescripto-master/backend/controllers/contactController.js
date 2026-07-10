import contactModel from "../models/contactModel.js";

// Submit a contact message (public)
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.json({ success: false, message: "All fields are required" });
    }
    const newContact = new contactModel({ name, email, subject, message, date: Date.now() });
    await newContact.save();
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get all contact messages (admin only)
const getContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find({}).sort({ date: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Mark message as read (admin only)
const markRead = async (req, res) => {
  try {
    const { contactId } = req.body;
    await contactModel.findByIdAndUpdate(contactId, { read: true });
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete message (admin only)
const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    await contactModel.findByIdAndDelete(contactId);
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { submitContact, getContacts, markRead, deleteContact };
