import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { 
    createRestaurant, 
    deleteRestaurant, 
    getAllRestaurants, 
    getSingleRestaurant, 
    updateRestaurant 
} from "../controllers/restaurant.controller.js";

const router = express.Router();

// 1. Static routes MUST come before dynamic routes
router.get("/all", getAllRestaurants);

// 2. Fixed spelling typo: RESTURANT_OWNER -> RESTAURANT_OWNER
router.post("/create", protect, authorize("RESTAURANT_OWNER"), createRestaurant);

// 3. Dynamic route comes after static ones
router.get("/:id", getSingleRestaurant);

router.put("/update/:id", protect, authorize("RESTAURANT_OWNER"), updateRestaurant);

router.delete("/delete/:id", protect, authorize("RESTAURANT_OWNER"), deleteRestaurant);

export default router;