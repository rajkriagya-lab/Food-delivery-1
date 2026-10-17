import { prisma } from "../db.js";

export const getAllOffers = async (_req, res) => {
    try {
        const offers = await prisma.coupon.findMany({
            where: { isActive: true, expiryDate: { gte: new Date() } },
            orderBy: { expiryDate: "asc" },
        });
        return res.status(200).json({ success: true, offers });
    } catch (error) {
        console.error("getAllOffers error:", error);
        return res.status(500).json({ success: false, message: "Unable to load offers." });
    }
};

export const getSavedCoupons = async (req, res) => {
    try {
        const saved = await prisma.userCoupon.findMany({
            where: { userId: req.user.id, coupon: { isActive: true, expiryDate: { gte: new Date() } } },
            include: { coupon: true },
            orderBy: { savedAt: "desc" },
        });
        return res.status(200).json({ success: true, savedCoupons: saved.map(({ coupon }) => coupon) });
    } catch (error) {
        console.error("getSavedCoupons error:", error);
        return res.status(500).json({ success: false, message: "Unable to load saved coupons." });
    }
};

export const toggleSaveCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;
        if (typeof couponId !== "string" || !couponId) {
            return res.status(400).json({ success: false, message: "A coupon ID is required." });
        }
        const coupon = await prisma.coupon.findFirst({
            where: { id: couponId, isActive: true, expiryDate: { gte: new Date() } },
            select: { id: true },
        });
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found or expired." });

        const key = { userId_couponId: { userId: req.user.id, couponId } };
        const existing = await prisma.userCoupon.findUnique({ where: key });
        if (existing) {
            await prisma.userCoupon.delete({ where: { id: existing.id } });
            return res.status(200).json({ success: true, message: "Coupon removed from wallet.", saved: false });
        }
        await prisma.userCoupon.create({ data: { userId: req.user.id, couponId } });
        return res.status(200).json({ success: true, message: "Coupon saved successfully.", saved: true });
    } catch (error) {
        console.error("toggleSaveCoupon error:", error);
        return res.status(500).json({ success: false, message: "Unable to update saved coupon." });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const subtotal = Number(cartTotal);
        if (typeof code !== "string" || !code.trim() || !Number.isFinite(subtotal) || subtotal < 0) {
            return res.status(400).json({ success: false, message: "A coupon code and valid cart total are required." });
        }

        const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
        if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
            return res.status(404).json({ success: false, message: "Invalid or expired coupon code." });
        }
        if (subtotal < coupon.minOrderValue) {
            return res.status(400).json({ success: false, message: `Minimum order of Rs. ${coupon.minOrderValue} required for this coupon.` });
        }

        let discountAmount = 0;
        let freeDelivery = false;
        if (coupon.discountType === "percentage") {
            discountAmount = subtotal * coupon.discountValue / 100;
            if (coupon.maxDiscount != null) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        } else if (coupon.discountType === "fixed") {
            discountAmount = Math.min(subtotal, coupon.discountValue);
        } else if (coupon.discountType === "free_delivery") {
            freeDelivery = true;
        } else {
            return res.status(400).json({ success: false, message: "This coupon has an unsupported discount type." });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully.",
            discountAmount,
            freeDelivery,
            finalTotal: Math.max(0, subtotal - discountAmount),
            couponCode: coupon.code,
        });
    } catch (error) {
        console.error("applyCoupon error:", error);
        return res.status(500).json({ success: false, message: "Unable to apply coupon." });
    }
};
