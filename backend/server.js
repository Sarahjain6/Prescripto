import express from "express";
import cors from "cors";
import "dotenv/config";
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

// CORS first — before everything
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "atoken", "dtoken"]
}));
app.options("*", cors());

app.use(express.json());

// Connect services
connectDB().catch(err => { console.error("MongoDB Error:", err); process.exit(1); });
connectCloudinary();

// Routes
app.get("/", (req, res) => res.send("Prescripto API Running ✅"));
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep Render alive — using fetch instead of https module
const keepAlive = () => {
  fetch("https://doctor-backend-cbt3.onrender.com/")
    .then(() => console.log("Keep-alive ping sent"))
    .catch(() => {});
};
setInterval(keepAlive, 840000);