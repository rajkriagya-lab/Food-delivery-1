import express from "express";

import {protect} from "../middleware/auth.middleware.js"
import { authorize} from "../middleware/authorize.middleware.js"
import { deleteUsers, getAdminOverview, getAllOrders, getAllRestaurants, getAllUsers, toggelRestaurantStatus } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/overview", protect, authorize("ADMIN"), getAdminOverview);
router.get("/users", protect, authorize("ADMIN"), getAllUsers);
router.get("/restaurants", protect, authorize("ADMIN"), getAllRestaurants);
router.get("/orders", protect, authorize("ADMIN"), getAllOrders);

router.patch(
    "/restaurants/:id/status",
    protect,
    authorize("ADMIN"),
    toggelRestaurantStatus
);

router.delete("/users/:id", protect, authorize("ADMIN"), deleteUsers);

export default router;