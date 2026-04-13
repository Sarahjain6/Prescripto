import express from "express";
import cors from "cors";
import "dotenv/config";
import https from "https";                          // ← move ALL imports to top
import fs from "fs";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import contactRouter from "./routes/contactRoute.js";

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect DB and Cloudinary
connectDB().catch(err => { console.error("MongoDB Error:", err); process.exit(1); });
connectCloudinary();

// ✅ CORS must be FIRST before any routes
app.use(cors({
  origin: [
    "https://prescripto-odgm.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "atoken", "dtoken"]
}));

// ✅ Handle preflight requests for ALL routes
app.options("*", cors());

app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("Prescripto API Running ✅"));
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Keep Render free tier alive (ping every 14 min)
setInterval(() => {
  https.get("https://doctor-backend-cbt3.onrender.com/", (res) => {
    console.log(`Keep-alive ping: ${res.statusCode}`);
  }).on("error", () => {});
}, 840000);