import { prisma } from "../db.js";

export const getAdminOverview = async (req, res) => {
    try {
        const [
            totalUsers,
            totalCustomers,
            totalRestaurantOwners,
            totalRestaurants,
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            revenueData,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: { role: "CUSTOMER" },
            }),
            prisma.user.count({
                where: { role: "RESTURANT_OWNER" },
            }),

            prisma.restaurant.count(),
            prisma.order.count(),
            prisma.order.count({
                where: { orderStatus: "PENDING" }
            }),
            prisma.order.count({
                where: { orderStatus: "DELIVERED" }
            }),
            prisma.order.count({
                where: { orderStatus: "CANCELLED" }
            }),
            prisma.order.aggregate({
                where: { orderStatus: "DELIVERED" },
                _sum: {
                    grandTotal: true,
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            overview: {
                totalUsers,
                totalCustomers,
                totalRestaurantOwners,
                totalRestaurants,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue: revenueData._sum.grandTotal || 0,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                nmae: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
        });

        res.status(200).json({
            success: true,
            totalUser: user.length,
            users,
        });
    } catch (error) {
        console.error("Get User Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        food: true,
                        categories: true,
                        orders: true,
                        reviews: true,
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            totalRestaurants: restaurants.length,
            resturants,
        });
    } catch (error) {
        console.error("Get Restaurant Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
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
        console.error("Get Orders Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const toggelRestaurantStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurants = await prisma.restaurants.findUnique({
            where: { id },
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Resturant not found.",
            });
        }

        const updatedRestaurant = await prisma.resturant.update({
            where: { id },
            data: {
                isOpen: !restaurant.isOpen,
            },
        });

        res.status(200).json({
            success: true,
            message: `Restaurant is now ${updatedRestaurant.isOpen ? "open" : 'closed'
                }.`,
            restaurant: updatedRestaurant,
        })
    } catch (error) {
        console.error("Toggel Restauarant Status Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const deleteUsers = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.users.id) {
            return res.status(400).json({
                success: false,
                message: "Admin cannot delete own account.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        await prisma.user.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (error) {
        console.error("Get Users Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};