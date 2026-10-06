import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSlot, getISTParts } from "../utils/slots.js";

// Fixed "now": 6 Oct 2026, 12:00 IST  (= 06:30 UTC)
const NOW = new Date("2026-10-06T06:30:00Z");

test("getISTParts converts UTC to IST regardless of server timezone", () => {
  assert.deepEqual(getISTParts(NOW), { year: 2026, month: 10, day: 6, hour: 12, minute: 0 });
  // 20:00 UTC on the 6th is already 01:30 IST on the 7th
  assert.deepEqual(getISTParts(new Date("2026-10-06T20:00:00Z")), { year: 2026, month: 10, day: 7, hour: 1, minute: 30 });
});

test("accepts a valid future slot today and in the window", () => {
  assert.equal(validateSlot("6_10_2026", "1:00 PM", NOW).ok, true);
  assert.equal(validateSlot("12_10_2026", "10:00 AM", NOW).ok, true); // day 6 of the window
  assert.equal(validateSlot("7_10_2026", "8:30 PM", NOW).ok, true); // last slot of the day
});

test("rejects past slots", () => {
  assert.equal(validateSlot("6_10_2026", "10:00 AM", NOW).ok, false);
  assert.equal(validateSlot("6_10_2026", "12:00 PM", NOW).ok, false); // exactly now
  assert.equal(validateSlot("5_10_2026", "5:00 PM", NOW).ok, false); // yesterday
});

test("rejects dates beyond the 7-day window", () => {
  assert.equal(validateSlot("13_10_2026", "10:00 AM", NOW).ok, false);
  assert.equal(validateSlot("1_1_2030", "10:00 AM", NOW).ok, false);
});

test("rejects times the UI never offers", () => {
  for (const t of ["9:30 AM", "9:00 PM", "10:15 AM", "12:00 AM", "25:00 PM", "10:00", "10:00 am"]) {
    assert.equal(validateSlot("7_10_2026", t, NOW).ok, false, t);
  }
});

test("rejects non-canonical spellings (would bypass double-booking checks)", () => {
  assert.equal(validateSlot("07_10_2026", "10:00 AM", NOW).ok, false);
  assert.equal(validateSlot("7_10_2026", "08:30 PM", NOW).ok, false);
  assert.equal(validateSlot(" 7_10_2026", "10:00 AM", NOW).ok, false);
});

test("rejects impossible calendar dates", () => {
  assert.equal(validateSlot("31_2_2026", "10:00 AM", NOW).ok, false);
});

test("rejects non-string input (NoSQL operator injection)", () => {
  assert.equal(validateSlot({ $ne: "" }, "10:00 AM", NOW).ok, false);
  assert.equal(validateSlot("7_10_2026", { $gt: "" }, NOW).ok, false);
  assert.equal(validateSlot(undefined, undefined, NOW).ok, false);
  assert.equal(validateSlot("a.b_c", "10:00 AM", NOW).ok, false);
});
