import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { prisma } from "../db.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
export const privateCvDirectory = path.resolve(directory, "../private-uploads");
fs.mkdirSync(privateCvDirectory, { recursive: true });

const cvUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, privateCvDirectory),
        filename: (_req, _file, callback) => callback(null, crypto.randomUUID() + ".pdf"),
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
        const valid = file.mimetype === "application/pdf" && path.extname(file.originalname).toLowerCase() === ".pdf";
        callback(valid ? null : new Error("Upload a PDF CV no larger than 5 MB."), valid);
    },
});
export const parseCvUpload = (req, res, next) => cvUpload.single("cv")(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, message: error.message });
    next();
});
const removeFile = async (file) => { if (file?.path) await fs.promises.unlink(file.path).catch(() => {}); };
const clean = (value, limit) => typeof value === "string" ? value.trim().slice(0, limit) : "";
const jobFields = (body) => {
    const data = Object.fromEntries(["title","department","type","location","summary","responsibilities","qualifications"].map((key) => [key, clean(body[key], key === "responsibilities" || key === "qualifications" ? 5000 : 500)]));
    if (Object.values(data).some((value) => !value)) return { error: "All job fields are required." };
    let deadline = null;
    if (body.deadline) { deadline = new Date(body.deadline); if (Number.isNaN(deadline.getTime())) return { error: "Enter a valid deadline." }; }
    return { data: { ...data, deadline } };
};

export const getActiveJobs = async (_req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { isActive: true, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
            select: { id: true, title: true, department: true, type: true, location: true, summary: true, responsibilities: true, qualifications: true, deadline: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });
        return res.json({ success: true, jobs });
    } catch (error) {
        console.error("getActiveJobs error:", error);
        return res.status(500).json({ success: false, message: "Unable to load current opportunities." });
    }
};

export const submitApplication = async (req, res) => {
    try {
        const fullName = clean(req.body.fullName, 120);
        const email = clean(req.body.email, 254).toLowerCase();
        const phone = clean(req.body.phone, 24);
        const jobId = clean(req.body.jobId, 64);
        if (fullName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[+()\d\s.-]{7,24}$/.test(phone) || !jobId) {
            await removeFile(req.file);
            return res.status(400).json({ success: false, message: "Enter a valid name, email, phone number, and position." });
        }
        if (!req.file) return res.status(400).json({ success: false, message: "A PDF CV is required." });
        const handle = await fs.promises.open(req.file.path, "r");
        const header = Buffer.alloc(5);
        await handle.read(header, 0, 5, 0);
        await handle.close();
        if (header.toString("ascii") !== "%PDF-") {
            await removeFile(req.file);
            return res.status(400).json({ success: false, message: "The uploaded file is not a valid PDF." });
        }
        const job = await prisma.job.findFirst({
            where: { id: jobId, isActive: true, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
            select: { id: true },
        });
        if (!job) {
            await removeFile(req.file);
            return res.status(404).json({ success: false, message: "This position is no longer accepting applications." });
        }
        await prisma.jobApplication.create({ data: { jobId, fullName, email, phone, cvPath: path.basename(req.file.filename) } });
        return res.status(201).json({ success: true, message: "Application received. Thank you for your interest." });
    } catch (error) {
        await removeFile(req.file);
        console.error("submitApplication error:", error);
        return res.status(500).json({ success: false, message: "Unable to submit your application right now." });
    }
};

export const listAdminJobs = async (_req, res) => {
    try { return res.json({ success: true, jobs: await prisma.job.findMany({ orderBy: { createdAt: "desc" } }) }); }
    catch (error) { console.error("listAdminJobs error:", error); return res.status(500).json({ success: false, message: "Unable to load job listings." }); }
};
export const createJob = async (req, res) => {
    const parsed = jobFields(req.body);
    if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });
    try { return res.status(201).json({ success: true, job: await prisma.job.create({ data: parsed.data }) }); }
    catch (error) { console.error("createJob error:", error); return res.status(500).json({ success: false, message: "Unable to create this job listing." }); }
};
export const updateJob = async (req, res) => {
    const parsed = jobFields(req.body);
    if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });
    try { return res.json({ success: true, job: await prisma.job.update({ where: { id: req.params.id }, data: parsed.data }) }); }
    catch (error) { if (error.code === "P2025") return res.status(404).json({ success: false, message: "Job listing not found." }); console.error("updateJob error:", error); return res.status(500).json({ success: false, message: "Unable to update this job listing." }); }
};
export const deactivateJob = async (req, res) => {
    try { return res.json({ success: true, job: await prisma.job.update({ where: { id: req.params.id }, data: { isActive: false } }) }); }
    catch (error) { if (error.code === "P2025") return res.status(404).json({ success: false, message: "Job listing not found." }); console.error("deactivateJob error:", error); return res.status(500).json({ success: false, message: "Unable to deactivate this job listing." }); }
};
export const listApplications = async (_req, res) => {
    try {
        const applications = await prisma.jobApplication.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true, job: { select: { id: true, title: true, department: true } } },
        });
        return res.json({ success: true, applications });
    } catch (error) { console.error("listApplications error:", error); return res.status(500).json({ success: false, message: "Unable to load applications." }); }
};
export const updateApplicationStatus = async (req, res) => {
    if (!["NEW","REVIEWING","SHORTLISTED","REJECTED","HIRED"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Choose a valid application status." });
    try {
        const application = await prisma.jobApplication.update({ where: { id: req.params.id }, data: { status: req.body.status }, select: { id: true, status: true } });
        return res.json({ success: true, application });
    } catch (error) { if (error.code === "P2025") return res.status(404).json({ success: false, message: "Application not found." }); console.error("updateApplicationStatus error:", error); return res.status(500).json({ success: false, message: "Unable to update this application." }); }
};
export const downloadApplicationCv = async (req, res) => {
    try {
        const application = await prisma.jobApplication.findUnique({ where: { id: req.params.id }, select: { cvPath: true } });
        if (!application) return res.status(404).json({ success: false, message: "Application not found." });
        const filename = path.resolve(privateCvDirectory, application.cvPath);
        if (path.dirname(filename) !== privateCvDirectory) return res.status(400).json({ success: false, message: "Invalid CV path." });
        return res.download(filename, req.params.id + "-cv.pdf", (error) => { if (error && !res.headersSent) res.status(404).json({ success: false, message: "CV file not found." }); });
    } catch (error) { console.error("downloadApplicationCv error:", error); return res.status(500).json({ success: false, message: "Unable to download this CV." }); }
};