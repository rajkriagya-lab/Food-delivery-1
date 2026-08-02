import { prisma } from "../db.js";

export const addToCart = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;

        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: "Food is required.",
            });
        }

        const food = await prisma.food.findUnique({
            where: { id: foodId },
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found.",
            });
        }

        if (!food.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Food is currently unavailable.",
            });
        }

        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: req.user.id,
                },
            });
        }

        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_foodId: {
                    cartId: cart.id,
                    foodId,
                },
            },
        });

        let cartItem;

        if (existingItem) {
            cartItem = await prisma.cartItem.update({
                where: {
                    id: existingItem.id,
                },
                data: {
                    quantity: existingItem.quantity + Number(quantity || 1),
                },
            });

            return res.status(200).json({
                success: true,
                message: "Cart Updated",
                item: cartItem,
            });
        } else {
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    foodId,
                    quantity: Number(quantity || 1),
                },
            });

            return res.status(201).json({
                success: true,
                message: "Item added to cart.",
                item: cartItem,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: {
                userId: req.user.id,
            },
            include: {
                items: {
                    include: {
                        food: {
                            include: {
                                restaurant: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                totalAmount: 0,
                totalItems: 0,
                items: [],
            });
        }

        let totalAmount = 0;
        cart.items.forEach((item) => {
            totalAmount += item.food.price * item.quantity;
        });

        return res.status(200).json({
            success: true,
            totalItems: cart.items.length,
            totalAmount,
            items: cart.items,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1.",
            });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: {
                id: itemId,
            },
            include: {
                cart: true,
            },
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found.",
            });
        }

        if (cartItem.cart.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this cart item.",
            });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: itemId },
            data: {
                quantity: Number(quantity),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully.",
            item: updatedItem,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
            },
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found.",
            });
        }

        if (cartItem.cart.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to remove this cart item.",
            });
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};