import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { upload } from "../middleware/multer.js";
import { createCategory, deleteCategory, getAllCategories, getResturantCategories, updatecategory } from "../controllers/category.controller.js";

const router =express.Router();

router.post(
    "/create",
    protect,
    authorize("RESTURANT_OWNER"),
    upload.single("image"),
    createCategory,
);

router.get("/restaurant/:restaurantId", getResturantCategories);
router.get("/all", getAllCategories);
router.put(
    "/update/:id",
    protect,
    authorize("RESTURANT_OWNER"),
    upload.single("image"),
    updatecategory,
);

router.delete("/:id", protect, authorize("RESTURANT_OWNER"), deleteCategory);

export default router;