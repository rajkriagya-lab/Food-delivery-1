import express from "express";
import { getMyProfile, handleAvatarUploadError, updateMyProfile, uploadProfileAvatar } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, uploadProfileAvatar, handleAvatarUploadError, updateMyProfile);
export default router;