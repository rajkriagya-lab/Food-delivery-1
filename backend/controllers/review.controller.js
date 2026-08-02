import { prisma } from "../db.js";

export const createReview = async (req, res) => {
    try {
        const { restaurantId, rating, comment } = req.body;
        if (!restaurantId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Restaurant and rating are required.",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5.",
            });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        const existingReview = await prisma.review.findUnique({
            where: {
                userId_restaurantId: {
                    userId: req.user.id,
                    restaurantId,
                },
            },
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this restaurant.",
            });
        }

        await prisma.review.create({
            data: {
                rating: Number(rating),
                comment,
                userId: req.user.id,
                restaurantId,
            },
        });

        const stats = await prisma.review.aggregate({
            where: { restaurantId },
            _avg: { rating: true },
            _count: true,
        });

        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                rating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
                totalReview: stats._count,
            },
        });

        res.status(201).json({
            success: true,
            message: "Review added successfully.",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getRestaurantReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const reviews = await prisma.review.findMany({
            where: { restaurantId },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            totalReview: reviews.length,
            reviews,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found.",
            });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this review.",
            });
        }

        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                rating: rating ? Number(rating) : review.rating,
                comment: comment !== undefined ? comment : review.comment,
            },
        });

        const stats = await prisma.review.aggregate({
            where: {
                restaurantId: review.restaurantId,
            },
            _avg: {
                rating: true,
            },
            _count: true,
        });

        await prisma.restaurant.update({
            where: {
                id: review.restaurantId,
            },
            data: {
                rating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
                totalReview: stats._count,
            },
        });

        res.status(200).json({
            success: true,
            message: "Review updated successfully.",
            review: updatedReview,
        });
    } catch (error) {
        console.error("Update Review Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found.",
            });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this review.",
            });
        }

        await prisma.review.delete({
            where: { id },
        });

        const stats = await prisma.review.aggregate({
            where: {
                restaurantId: review.restaurantId,
            },
            _avg: {
                rating: true,
            },
            _count: true,
        });

        await prisma.restaurant.update({
            where: {
                id: review.restaurantId,
            },
            data: {
                rating: stats._count === 0 ? 0 : Number(stats._avg.rating.toFixed(1)),
                totalReview: stats._count,
            },
        });

        res.status(200).json({
            success: true,
            message: "Review deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};