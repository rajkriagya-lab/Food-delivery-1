import express from "express";

import {protect} from "../middleware/auth.middleware.js";
import {authorize} from "../middleware/authorize.middleware.js";
import { createReview, deleteReview, getRestaurantReviews, updateReview } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/create", protect, authorize("CUSTOMER"), createReview);

router.get("/restaurant/:restaurantId", getRestaurantReviews);

router.put("/update/:id", protect, authorize("CUSTOMER"), updateReview);

router.delete("/:id", protect, authorize("CUSTOMER"), deleteReview);

export default router;