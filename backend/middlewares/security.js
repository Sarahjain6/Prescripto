// Minimal security headers (a lightweight stand-in for helmet, which would need
// a new dependency + lockfile update).
export const securityHeaders = (req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
    "Cross-Origin-Opener-Policy": "same-origin",
  });
  next();
};
