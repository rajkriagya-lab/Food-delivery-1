import express from "express";
import {protect} from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js"
import { createAddress, deleteAddress, getAddress, setDefaultAddress, updateAddress } from "../controllers/adderss.controller.js";

const router = express.Router();

router.post("/create", protect, authorize("CUSTOMER"), createAddress);
router.get("/my", protect, authorize("CUSTOMER"), getAddress);
router.put("/update/:id", protect, authorize("CUSTOMER"), updateAddress);
router.delete("/delete/:id", protect, authorize("CUSTOMER"), deleteAddress);
router.patch("/default/:id", protect, authorize("CUSTOMER"), setDefaultAddress);

export default router;