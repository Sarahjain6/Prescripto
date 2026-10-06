import mongoose from "mongoose";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";

export const isId = (v) => typeof v === "string" && mongoose.isValidObjectId(v);

// Atomically remove one slot from a doctor's booked list.
export const releaseSlot = ({ docId, slotDate, slotTime }) =>
  doctorModel.updateOne({ _id: docId }, { $pull: { [`slots_booked.${slotDate}`]: slotTime } });

// Cancel an appointment exactly once and free its slot.
// `filter` scopes who may cancel (e.g. { _id, userId } for a patient).
// The cancelled:false / isCompleted:false conditions make the flip atomic, so a
// double-click or two actors cancelling at once can't release the slot twice,
// and completed visits can't be cancelled after the fact.
export const cancelAppointmentAtomic = async (filter) => {
  const appointment = await appointmentModel.findOneAndUpdate(
    { ...filter, cancelled: false, isCompleted: false },
    { cancelled: true },
    { new: true }
  );
  if (!appointment) return null;
  await releaseSlot(appointment);
  return appointment;
};
