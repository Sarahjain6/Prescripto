import express from "express";
import {
  registerUser, loginUser, getProfile, updateProfile,
  bookAppointment, listAppointment, cancelAppointment,
  paymentRazorpay, verifyRazorpay,
} from "../controllers/userController.js";
import { authUser } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const userRouter = express.Router();

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", authLimiter, loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", authUser, upload.single("image"), updateProfile);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verify-razorpay", authUser, verifyRazorpay);

export default userRouter;