import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { getDashboardOverview, getRecentOrders, getTopSellingFoods } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
    "/overview",
    protect,
    authorize("RESTURANT_OWNER"),
    getDashboardOverview,
);

router.get(
    "/recent-order",
    protect,
    authorize("RESTURANT_OWNER"),
    getRecentOrders,
);

router.get(
    "/top-selling-foods",
    protect,
    authorize("RESTURANT_OWNER"),
    getTopSellingFoods,
);

export default router;