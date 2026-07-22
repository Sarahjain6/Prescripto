import jwt from "jsonwebtoken";

// Admin Auth
export const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) return res.json({ success: false, message: "Not Authorized" });
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Not Authorized" });
    }
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Doctor Auth
export const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) return res.json({ success: false, message: "Not Authorized" });
    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
    req.docId = decoded.id;
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// User Auth
export const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) return res.json({ success: false, message: "Not Authorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.json({ success: false, message: "Session expired, please login again", tokenExpired: true });
    }
    res.json({ success: false, message: "Not Authorized", tokenExpired: true });
  }
};
