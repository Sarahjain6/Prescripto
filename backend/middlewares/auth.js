import jwt from "jsonwebtoken";
import { safeEqual } from "../utils/security.js";

// NOTE: messages deliberately contain "Not Authorized" - the admin/doctor
// frontends match that text to log the user out automatically.
const NOT_AUTH = "Not Authorized";
const EXPIRED = "Not Authorized - session expired, please login again";

const verify = (token) => jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

const reject = (res, error) =>
  res.json({
    success: false,
    message: error?.name === "TokenExpiredError" ? EXPIRED : NOT_AUTH,
    tokenExpired: true,
  });

// Admin Auth
export const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) return res.json({ success: false, message: NOT_AUTH });
    const decoded = verify(atoken);
    if (!safeEqual(decoded.email, process.env.ADMIN_EMAIL)) {
      return res.json({ success: false, message: NOT_AUTH });
    }
    next();
  } catch (error) {
    reject(res, error);
  }
};

// Doctor Auth
export const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) return res.json({ success: false, message: NOT_AUTH });
    const decoded = verify(dtoken);
    if (!decoded.id) return res.json({ success: false, message: NOT_AUTH });
    req.docId = decoded.id;
    next();
  } catch (error) {
    reject(res, error);
  }
};

// User Auth
export const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) return res.json({ success: false, message: NOT_AUTH });
    const decoded = verify(token);
    if (!decoded.id) return res.json({ success: false, message: NOT_AUTH });
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.json({ success: false, message: "Session expired, please login again", tokenExpired: true });
    }
    res.json({ success: false, message: NOT_AUTH, tokenExpired: true });
  }
};
