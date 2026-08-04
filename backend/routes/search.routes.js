import express from "express";
import { getPopularFoods, getPopularRestaurant, searchFoods, searchRestaurants } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/restaurants", searchRestaurants);
router.get("/foods", searchFoods);
router.get("/popular-resturants", getPopularRestaurant);
router.get("/popular-foods", getPopularFoods);

export default router;