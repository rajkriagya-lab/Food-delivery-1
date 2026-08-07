import express from "express";
import { protect } from "../middleware/auth.middleware.js"
import { authorize } from "../middleware/authorize.middleware.js"
import { upload } from "../middleware/multer.js"
import { createFood, deleteFood, getAllFood, getFoodsByCategory, getFoodsByRestaurant, getSingleFood, updateFood } from "../controllers/food.controller.js";

const router = express.Router();

router.post(
    "/create",
    protect,
    authorize("RESTURANT_OWNER"),
    upload.single("image"),
    createFood,
);

router.get("/all", getAllFood);
router.get("/single/:slug", getSingleFood);
router.get("/category/:categoryId", getFoodsByCategory);
router.get("/restaurant/:restaurantId", getFoodsByRestaurant);

router.put(
    "/update/:id",
    protect,
    authorize("RESTURANT_OWNER"),
    upload.single("image"),
    updateFood,
);

router.delete("/:id", protect, authorize("RESTURANT_OWNER"), deleteFood);

export default router;