import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { 
    cancelOrder, 
    createOrder, 
    getMyOrder, 
    getRestaurantOrder, 
    getSingleOrder, 
    updateOrderStatus 
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create", protect, authorize("CUSTOMER"), createOrder);

router.get("/my", protect, authorize("CUSTOMER"), getMyOrder);

router.get("/single/:id", protect, getSingleOrder);

router.get(
    "/restaurant",
    protect,
    authorize("RESTURANT_OWNER"),
    getRestaurantOrder
);

router.patch(
    "/status/:id",
    protect,
    authorize("RESTURANT_OWNER"),
    updateOrderStatus
);

router.patch("/cancel/:id", protect, authorize("CUSTOMER"), cancelOrder);

export default router;