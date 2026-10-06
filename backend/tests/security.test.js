import { test } from "node:test";
import assert from "node:assert/strict";
import { safeEqual } from "../utils/security.js";

test("safeEqual matches equal strings only", () => {
  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abd"), false);
  assert.equal(safeEqual("abc", "abcd"), false); // different lengths don't throw
});

test("safeEqual tolerates undefined/null without throwing", () => {
  assert.equal(safeEqual(undefined, "x"), false);
  assert.equal(safeEqual(null, null), true);
});
