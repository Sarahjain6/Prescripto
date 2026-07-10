import express from "express";
import { submitContact, getContacts, markRead, deleteContact } from "../controllers/contactController.js";
import { authAdmin } from "../middlewares/auth.js";

const contactRouter = express.Router();

contactRouter.post("/submit", submitContact);                    // public
contactRouter.get("/all", authAdmin, getContacts);              // admin only
contactRouter.post("/mark-read", authAdmin, markRead);          // admin only
contactRouter.post("/delete", authAdmin, deleteContact);        // admin only

export default contactRouter;
