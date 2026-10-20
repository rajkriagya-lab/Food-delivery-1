import express from "express";
import rateLimit from "express-rate-limit";
import { authorize } from "../middleware/authorize.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { createJob, deactivateJob, downloadApplicationCv, getActiveJobs, listAdminJobs, listApplications, parseCvUpload, submitApplication, updateApplicationStatus, updateJob } from "../controllers/careers.controller.js";

const router = express.Router();
const applicationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many applications. Please try again later." },
});
const admin = [protect, authorize("ADMIN")];

router.get("/jobs", getActiveJobs);
router.post("/applications", applicationLimiter, parseCvUpload, submitApplication);
router.get("/admin/jobs", ...admin, listAdminJobs);
router.post("/admin/jobs", ...admin, createJob);
router.patch("/admin/jobs/:id", ...admin, updateJob);
router.delete("/admin/jobs/:id", ...admin, deactivateJob);
router.get("/admin/applications", ...admin, listApplications);
router.patch("/admin/applications/:id/status", ...admin, updateApplicationStatus);
router.get("/admin/applications/:id/cv", ...admin, downloadApplicationCv);

export default router;