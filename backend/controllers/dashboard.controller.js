import { prisma } from "../db.js";

const getOwnerRestaurant = async (ownerId) => {
    return await prisma.restaurant.findFirst({ where: { ownerId } });
};

export const getDashboardOverview = async (req, res) => {
    try {
        const restaurant = await getOwnerRestaurant(req.user.id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [
            totalOrders,
            todayOrders,
            pendingOrders,
            deliveryOrders,
            cancelledOrders,
            totalFoods,
            totalCategories,
            revenueData,
        ] = await Promise.all([
            prisma.order.count({
                where: { restaurantId: restaurant.id },
            }),

            prisma.order.count({
                where: {
                    restaurantId: restaurant.id,
                    createdAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            }),

            prisma.order.count({
                where: {
                    restaurantId: restaurant.id,
                    orderStatus: "PENDING",
                },
            }),

            prisma.order.count({
                where: {
                    restaurantId: restaurant.id,
                    orderStatus: "DELIVERED",
                },
            }),

            prisma.order.count({
                where: {
                    restaurantId: restaurant.id,
                    orderStatus: "CANCELLED",
                },
            }),

            prisma.food.count({
                where: { restaurantId: restaurant.id },
            }),

            prisma.category.count({
                where: { restaurantId: restaurant.id },
            }),

            prisma.order.aggregate({
                where: {
                    restaurantId: restaurant.id,
                    orderStatus: "DELIVERED",
                },
                _sum: {
                    grantTotal: true,
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            dashboard: {
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    slug: restaurant.slug,
                    rating: restaurant.rating,
                    totalReview: restaurant.totalReview,
                },
                totalOrders,
                todayOrders,
                pendingOrders,
                deliveredOrders: deliveryOrders,
                cancelledOrders,
                totalFoods,
                totalCategories,
                totalRevenue: revenueData._sum.grantTotal || 0,
            },
        });
    } catch (error) {
        console.log("error", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getRecentOrders = async (req, res) => {
    try {
        const restaurant = await getOwnerRestaurant(req.user.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found for this owner.",
            });
        }

        const orders = await prisma.order.findMany({
            where: {
                restaurantId: restaurant.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                address: true,
                items: true,
            },
        });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders,
        });
    } catch (error) {
        console.log("error", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getTopSellingFoods = async (req, res) => {
    try {
        const restaurant = await getOwnerRestaurant(req.user.id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found for this owner.",
            });
        }

        // Change prisma.orderItems to prisma.orderItem (or match your exact schema model name)
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    restaurantId: restaurant.id,
                    orderStatus: "DELIVERED",
                },
            },
            include: {
                food: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        price: true,
                    },
                },
            },
        });

        const foodMap = {};

        orderItems.forEach((item) => {
            if (!foodMap[item.foodId]) {
                foodMap[item.foodId] = {
                    foodId: item.foodId,
                    name: item.food?.name || item.name,
                    image: item.food?.image,
                    totalSold: 0, 
                    totalRevenue: 0,
                };
            }

            foodMap[item.foodId].totalSold += item.quantity;
            foodMap[item.foodId].totalRevenue += item.price * item.quantity;
        });

        const topSellingFoods = Object.values(foodMap)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            foods: topSellingFoods,
        });
    } catch (error) {
        console.log("error", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};