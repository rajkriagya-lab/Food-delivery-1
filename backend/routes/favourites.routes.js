import express from "express";

import {protect} from "../middleware/auth.middleware.js";
import {authorize} from "../middleware/authorize.middleware.js";
import { getMyFavourites,  removeFavourite,  toggelFavourites } from "../controllers/favourites.controller.js";


const router = express.Router();

router.post("/toggle/:foodId", protect, authorize("CUSTOMER"), toggelFavourites);

router.get("/my", protect, authorize("CUSTOMER"), getMyFavourites);

router.delete("/:foodId", protect, authorize("CUSTOMER"), removeFavourite);

export default router;
