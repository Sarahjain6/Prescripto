// Log the real error on the server, send the client a generic message so we
// never leak stack details, DB errors, or internals.
export const serverError = (res, error, context = "") => {
  console.error(`[error]${context ? " " + context : ""}:`, error);
  return res.json({ success: false, message: "Something went wrong. Please try again." });
};

export const fail = (res, message) => res.json({ success: false, message });
