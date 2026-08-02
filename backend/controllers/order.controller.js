import { prisma } from "../db.js";

export const createOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod } = req.body;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address is required.",
            });
        }

        const address = await prisma.address.findUnique({
            where: {
                id: addressId,
            },
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: { food: true },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        const restaurantId = cart.items[0].food.restaurantId;

        const isSameRestaurant = cart.items.every(
            (item) => item.food.restaurantId === restaurantId,
        );

        if (!isSameRestaurant) {
            return res.status(400).json({
                success: false,
                message: "All items in the cart must be from the same restaurant.",
            });
        }

        let totalAmount = 0;
        cart.items.forEach((item) => {
            totalAmount += item.food.price * item.quantity;
        });

        const deliveryFee = 100;
        const grantTotal = totalAmount + deliveryFee;

        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                restaurantId,
                addressId,
                totalAmount,
                deliveryFee,
                grantTotal,
                paymentMethod: paymentMethod || "CASH_ON_DELIVERY",
                items: {
                    create: cart.items.map((item) => ({
                        foodId: item.foodId,
                        name: item.food.name,
                        price: item.food.price,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                items: true,
                address: true,
                restaurant: true,
            },
        });

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            order,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyOrder = async (req, res) => {
    try {
        const order = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                items: true,
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
                address: true,
            },
        });

        res.status(200).json({
            success: true,
            totalOrder: order.length,
            order,
        });
    } catch (error) {
        console.log("Get My Order Error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
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
                        ownerId: true,
                    },
                },
                address: true,
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        const isCustomer = order.userId === req.user.id;
        const isRestaurantOwner = order.restaurant.ownerId === req.user.id;
        const isAdmin = req.user.role === "ADMIN";

        if (!isCustomer && !isRestaurantOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this order.",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Get Single Order Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getRestaurantOrder = async (req, res) => {
    try {
        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId: req.user.id },
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found for this owner.",
            });
        }

        const order = await prisma.order.findMany({
            where: { restaurantId: restaurant.id },
            orderBy: { createdAt: "desc" },
            include: {
                items: true,
                address: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            totalOrder: order.length,
            order,
        });
    } catch (error) {
        console.error("Get Restaurant Order Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        // Synchronized with Prisma schema OrderStatus enum values
        const allowedStatus = [
            "PENDING",
            "PROCESSING",
            "OUT_FOR_DELIVERY",
            "DELIVERED", 
            "CANCELLED",
        ];

        if (!allowedStatus.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status.",
            });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (order.restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this order.",
            });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { orderStatus },
        });

        res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this order.",
            });
        }

        if (order.orderStatus !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be cancelled.",
            });
        }

        await prisma.order.update({
            where: { id },
            data: {
                orderStatus: "CANCELLED",
            },
        });

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
        });
    } catch (error) {
        console.error("Cancel Order Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};