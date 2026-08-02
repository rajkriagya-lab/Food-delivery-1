import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { createRestaurant, deleteRestaurant, getAllRestaurants, getSingleRestaurant, updateRestaurant } from "../controllers/restaurant.controller.js"

const router = express.Router();
 
router.post("/create", protect, authorize("RESTURANT_OWNER"), createRestaurant);

router.post(
    "/create",
    protect,
    authorize("RESTURANT_OWNER"),
    createRestaurant,
)

router.get("/all", getAllRestaurants);
router.get("/:slug", getSingleRestaurant);

router.put(
    "/update/:id",
    protect,
    authorize("RESTURANT_OWNER"),
    updateRestaurant,
)

router.get("/delete/:id", deleteRestaurant);


export default router;