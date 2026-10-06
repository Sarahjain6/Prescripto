// Small dependency-free, in-memory fixed-window rate limiter (per client IP).
// Good for a single instance (this project's Render setup). If you scale to
// several instances, swap this for express-rate-limit with a Redis store.
export const rateLimit = ({ windowMs, max, message = "Too many requests. Please try again later." }) => {
  const hits = new Map(); // ip -> { count, resetAt }

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs);
  sweep.unref(); // don't keep the process alive just for cleanup

  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};

// Ready-made limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts. Please try again in a few minutes.",
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many messages sent. Please try again later.",
});
