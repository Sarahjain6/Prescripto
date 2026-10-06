import crypto from "crypto";

// Constant-time string comparison. Both inputs are hashed first so the buffers
// are always the same length (timingSafeEqual throws on different lengths).
export const safeEqual = (a, b) => {
  const ha = crypto.createHash("sha256").update(String(a ?? "")).digest();
  const hb = crypto.createHash("sha256").update(String(b ?? "")).digest();
  return crypto.timingSafeEqual(ha, hb);
};
