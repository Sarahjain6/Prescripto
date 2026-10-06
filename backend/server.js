import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import multer from "multer";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import contactRouter from "./routes/contactRoute.js";
import { securityHeaders } from "./middlewares/security.js";

// ── Fail fast if critical config is missing (clear message instead of
//    mysterious errors on the first request) ──────────────────────────────
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn("⚠️  JWT_SECRET is short. Use a random string of 32+ characters.");
}

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const app = express();
const PORT = process.env.PORT || 4000;

app.disable("x-powered-by");
// Render / most hosts sit behind a proxy; without this every client looks like
// the same IP and rate limiting would punish everybody together.
app.set("trust proxy", 1);
app.use(securityHeaders);

// ── CORS: only our own frontends may call the API from a browser ───────────
// Override with CORS_ORIGINS="https://a.com,https://b.com" (comma separated).
const DEFAULT_ORIGINS = [
  "https://prescripto-k3en.vercel.app", // patient app
  "https://prescripto-nn59.vercel.app", // admin / doctor app
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

const corsOptions = {
  origin: (origin, cb) => {
    // no Origin header = curl / server-to-server / same-origin: allow
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false); // browser will block the response
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "atoken", "dtoken"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));

// Connect services
connectDB().catch((err) => { console.error("MongoDB Error:", err); process.exit(1); });
connectCloudinary();

// Routes
app.get("/", (req, res) => res.send("Prescripto API Running ✅"));
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);

// Unknown routes -> JSON 404 (instead of Express's HTML page)
app.use((req, res) => res.status(404).json({ success: false, message: "Not found" }));

// Central error handler: upload problems, bad JSON bodies, anything uncaught.
// Always JSON, never a stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.message === "INVALID_FILE_TYPE") {
    return res.status(400).json({ success: false, message: "Only JPG, PNG, WEBP or GIF images are allowed" });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 5 MB)" : "Invalid file upload";
    return res.status(400).json({ success: false, message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error("[unhandled]", err);
  res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep a free-tier Render instance awake. The URL comes from the environment
// (Render sets RENDER_EXTERNAL_URL automatically) instead of being hard-coded.
const keepAliveUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;
if (keepAliveUrl) {
  setInterval(() => {
    fetch(keepAliveUrl)
      .then(() => console.log("Keep-alive ping sent"))
      .catch(() => {});
  }, 14 * 60 * 1000).unref();
}
