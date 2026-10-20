import express from "express";
import rateLimit from "express-rate-limit";
import { createPartnerApplication } from "../controllers/partner.controller.js";

const router = express.Router();
const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many applications from this connection. Please try again later." },
});

router.post("/applications", applicationLimiter, createPartnerApplication);

export default router;
