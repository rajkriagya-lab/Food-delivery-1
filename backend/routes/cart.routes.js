import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { addToCart, clearCart, getCart, removeCartItem, updateCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add", protect, authorize("CUSTOMER"), addToCart);

router.get("/", protect, authorize("CUSTOMER"), getCart);

router.put("/update/:itemId", protect, authorize("CUSTOMER"), updateCart);

router.delete(
    "/remove/:itemId",
    protect,
    authorize("CUSTOMER"),
    removeCartItem,
);

router.delete("/clear", protect, authorize("CUSTOMER"), clearCart);

export default router;