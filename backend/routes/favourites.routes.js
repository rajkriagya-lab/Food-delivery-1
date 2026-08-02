import express from "express";

import {protect} from "../middleware/auth.middleware.js";
import {authorize} from "../middleware/authorize.middleware.js";
import { getMyFavourites, removeFavourte, toggelFavourites } from "../controllers/favourites.controller";


const router = express.Router();

router.post("/toggle/:foodId", protect, authorize("CUSTOMER"), toggelFavourites);

router.get("/my", protect, authorize("CUSTOMER"), getMyFavourites);

router.delete("/foodId", protect, authorize("CUSTOME"), removeFavourte);

export default router;