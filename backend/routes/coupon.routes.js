import express from "express";
import { applyCoupon, getAllOffers, getSavedCoupons, toggleSaveCoupon } from "../controllers/coupon.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/all", getAllOffers);
router.get("/saved", protect, authorize("CUSTOMER"), getSavedCoupons);
router.post("/save", protect, authorize("CUSTOMER"), toggleSaveCoupon);
router.post("/apply", protect, authorize("CUSTOMER"), applyCoupon);

export default router;
