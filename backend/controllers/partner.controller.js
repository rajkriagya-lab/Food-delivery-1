import { z } from "zod";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { prisma } from "../db.js";

const applicationSchema = z.object({
  ownerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7).max(24),
  restaurantName: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  cuisine: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

const applicationStatus = z.enum(["PENDING", "REVIEWING", "APPROVED", "DECLINED"]);

export const createPartnerApplication = async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Check the required restaurant and contact details." });
  }

  try {
    const existingAccount = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (existingAccount) {
      return res.status(409).json({ success: false, message: "This email already has an account. Use an email that is not registered yet." });
    }
    const { password, confirmPassword: _confirmPassword, ...details } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);
    const application = await prisma.partnerApplication.create({ data: { ...details, passwordHash } });
    return res.status(201).json({
      success: true,
      message: "Partner application received and is pending review.",
      application: {
        id: application.id,
        ownerName: application.ownerName,
        restaurantName: application.restaurantName,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error("Create partner application failed:", error);
    return res.status(500).json({ success: false, message: "Could not submit your application. Please try again." });
  }
};

export const getPartnerApplications = async (_req, res) => {
  try {
    const applications = await prisma.partnerApplication.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, ownerName: true, email: true, phone: true, restaurantName: true, location: true, cuisine: true, status: true, userId: true, createdAt: true },
    });
    return res.json({ success: true, applications });
  } catch (error) {
    console.error("Get partner applications failed:", error);
    return res.status(500).json({ success: false, message: "Could not load partner applications." });
  }
};

export const updatePartnerApplicationStatus = async (req, res) => {
  const parsed = applicationStatus.safeParse(req.body.status);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Choose a valid application status." });
  }
  try {
    const application = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.partnerApplication.findUnique({ where: { id: req.params.id } });
      if (!existing) return null;
      if (existing.status === "DECLINED" && parsed.data !== "DECLINED") {
        const conflict = new Error("A declined application cannot be reopened. Ask the applicant to submit a new application.");
        conflict.status = 409;
        throw conflict;
      }
      if (existing.userId && parsed.data !== "APPROVED") {
        const conflict = new Error("This application already has an owner account and cannot be reverted.");
        conflict.status = 409;
        throw conflict;
      }

      let userId = existing.userId;
      if (parsed.data === "APPROVED" && !userId) {
        const matchingUser = await transaction.user.findFirst({ where: { OR: [{ email: existing.email }, { phone: existing.phone }] } });
        if (matchingUser) {
          const conflict = new Error("An account already uses this email or phone. Review the application manually.");
          conflict.status = 409;
          throw conflict;
        }
        if (!existing.passwordHash) {
          const conflict = new Error("This application has no password for account setup. Ask the applicant to submit it again.");
          conflict.status = 409;
          throw conflict;
        }
        const owner = await transaction.user.create({ data: { name: existing.ownerName, email: existing.email, phone: existing.phone, password: existing.passwordHash, role: "RESTURANT_OWNER" } });
        const restaurantSlug = `${slugify(existing.restaurantName, { lower: true, strict: true })}-${existing.id.slice(-6)}`;
        await transaction.restaurant.create({ data: { name: existing.restaurantName, slug: restaurantSlug, address: existing.location, city: existing.location, phone: existing.phone, email: existing.email, ownerId: owner.id } });
        userId = owner.id;
      }

      return transaction.partnerApplication.update({
        where: { id: existing.id },
        data: { status: parsed.data, userId, ...(userId || parsed.data === "DECLINED" ? { passwordHash: null } : {}) },
        select: { id: true, ownerName: true, email: true, phone: true, restaurantName: true, location: true, cuisine: true, status: true, userId: true, createdAt: true },
      });
    });
    if (!application) return res.status(404).json({ success: false, message: "Partner application not found." });
    return res.json({ success: true, application });
  } catch (error) {
    if (error.status === 409) return res.status(409).json({ success: false, message: error.message });
    if (error?.code === "P2025") return res.status(404).json({ success: false, message: "Partner application not found." });
    console.error("Update partner application failed:", error);
    return res.status(500).json({ success: false, message: "Could not update application status." });
  }
};
