const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllOffers = async (req, res) => {
    try {
        const currentDate = new Date();
        const offers = await prisma.coupon.findMany({
            where: {
                isActive: true,
                expiryDate: { gte: currentDate }
            }
        });
        res.status(200).json({ success: true, offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.toggleSaveCoupon = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { couponId } = req.body;

        
        const existingSave = await prisma.userCoupon.findUnique({
            where: {
                userId_couponId: { userId, couponId }
            }
        });

        if (existingSave) {
            
            await prisma.userCoupon.delete({
                where: { id: existingSave.id }
            });
            return res.status(200).json({ success: true, message: 'Coupon removed from wallet', saved: false });
        } else {
            
            await prisma.userCoupon.create({
                data: { userId, couponId }
            });
            return res.status(200).json({ success: true, message: 'Coupon saved successfully', saved: true });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon || !coupon.isActive) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
        }

        // Check expiry date
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ success: false, message: 'This coupon has expired' });
        }

        if (cartTotal < coupon.minOrderValue) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum order of Rs. ${coupon.minOrderValue} required for this coupon` 
            });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'free_delivery') {
            discountAmount = 100; 
        }

        const finalTotal = Math.max(0, cartTotal - discountAmount);

        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully!',
            discountAmount,
            finalTotal,
            couponCode: coupon.code
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};