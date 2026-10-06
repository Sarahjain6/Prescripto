// Server-side validation of appointment slots.
// The patient UI generates slots in IST (Asia/Kolkata); the server re-checks every
// booking so a crafted request can't book past slots, far-future slots, odd
// times, or use alternate spellings of the same slot to dodge double-booking.

const IST = "Asia/Kolkata";

// Canonical formats only (no leading zeros) so "6_10_2026" and "06_10_2026"
// can never be two different keys for the same day.
const SLOT_DATE_RE = /^([1-9]|[12]\d|3[01])_([1-9]|1[0-2])_(\d{4})$/;
const SLOT_TIME_RE = /^(1[0-2]|[1-9]):(00|30) (AM|PM)$/;

export const BOOKING_WINDOW_DAYS = 7;
export const FIRST_SLOT_HOUR = 10; // 10:00 AM
export const LAST_SLOT_HOUR = 20; // last slot starts 8:30 PM

// Current wall-clock time in IST, regardless of the server's own timezone.
export const getISTParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
};

const parseSlotDate = (slotDate) => {
  const m = SLOT_DATE_RE.exec(slotDate);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(year, month - 1, day));
  // reject impossible dates such as 31_2_2026
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return { year, month, day };
};

const parseSlotTime = (slotTime) => {
  const m = SLOT_TIME_RE.exec(slotTime);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const pm = m[3] === "PM";
  if (pm && hour !== 12) hour += 12;
  if (!pm && hour === 12) hour = 0;
  if (hour < FIRST_SLOT_HOUR || hour > LAST_SLOT_HOUR) return null;
  return { hour, minute };
};

export const validateSlot = (slotDate, slotTime, now = new Date()) => {
  // typeof check first: stops objects like {"$ne": ""} reaching a DB query
  if (typeof slotDate !== "string" || typeof slotTime !== "string") {
    return { ok: false, message: "Invalid slot" };
  }
  const d = parseSlotDate(slotDate);
  const t = parseSlotTime(slotTime);
  if (!d || !t) return { ok: false, message: "Invalid slot" };

  const n = getISTParts(now);
  const dayDiff = (Date.UTC(d.year, d.month - 1, d.day) - Date.UTC(n.year, n.month - 1, n.day)) / 86400000;
  if (dayDiff < 0 || dayDiff >= BOOKING_WINDOW_DAYS) {
    return { ok: false, message: "Slot date is outside the booking window" };
  }

  const slotMoment = Date.UTC(d.year, d.month - 1, d.day, t.hour, t.minute);
  const nowMoment = Date.UTC(n.year, n.month - 1, n.day, n.hour, n.minute);
  if (slotMoment <= nowMoment) return { ok: false, message: "This slot is in the past" };

  return { ok: true };
};
