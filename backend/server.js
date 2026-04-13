import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import contactRouter from "./routes/contactRoute.js";
import fs from "fs";

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const app = express();
const PORT = process.env.PORT || 4000;

connectDB().catch(err => {
  console.error("MongoDB Error:", err);
  process.exit(1);
});

connectCloudinary();

app.use(express.json());

app.use(cors({
  origin: "*",
  credentials: true
}));

app.get("/", (req, res) => res.send("Prescripto API Running ✅"));

app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});