import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { esewaFailure, initiateEsewa, initiateKhalti, verifyEsewaSuccess, verifyKhaltiReturn } from "../controllers/payment.controller.js";

const router = express.Router();
router.post("/esewa/initiate/:orderId", protect, authorize("CUSTOMER"), initiateEsewa);
router.get("/esewa/success", verifyEsewaSuccess);
router.get("/esewa/failure", esewaFailure);
router.post("/khalti/initiate/:orderId", protect, authorize("CUSTOMER"), initiateKhalti);
router.get("/khalti/return", verifyKhaltiReturn);
export default router;
