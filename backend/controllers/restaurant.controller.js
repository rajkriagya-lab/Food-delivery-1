import { prisma } from "../db.js";
import slugify from "slugify";

export const createRestaurant = async (req, res) => {
    try {
        const {
            name,
            description,
            phone,
            email,
            address,
            city,
            openingTime,
            closingTime,
        } = req.body;

        if (!name || !address || !city) {
            return res.status(400).json({
                success: false,
                message: "Name, address and city are required.",
            });
        }

        const slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true,
        });

        const existingRestaurant = await prisma.restaurant.findUnique({
            where: {
                slug,
            },
        });

        if (existingRestaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant already exists.",
            });
        }

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                description,
                phone,
                email,
                address,
                city,
                openingTime,
                closingTime,
                ownerId: req.user.id,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Restaurant created successfully.",
            restaurant,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            count: restaurants.length,
            restaurants,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSingleRestaurant = async (req, res) => {
    try {
        const { id } = req.params; // or slug, depending on your route parameter name

        const restaurant = await prisma.restaurant.findFirst({
            where: {
                OR: [
                    { id: id },
                    { slug: id }
                ]
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        return res.status(200).json({
            success: true,
            restaurant,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            phone,
            email,
            address,
            city,
            openingTime,
            closingTime,
            isOpen,
        } = req.body;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
        });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this restaurant.",
            });
        }

        let slug = restaurant.slug;
        if (name && name !== restaurant.name) {
            slug = slugify(name, {
                lower: true,
                strict: true,
                trim: true,
            });
        }

        const existingRestaurant = await prisma.restaurant.findFirst({
            where: {
                slug,
                NOT: {
                    id,
                },
            },
        });

        if (existingRestaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant with this name already exists.",
            });
        }

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                phone,
                email,
                address,
                city,
                openingTime,
                closingTime,
                isOpen,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Restaurant updated successfully.",
            restaurant: updatedRestaurant,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this restaurant.",
            });
        }

        await prisma.restaurant.delete({
            where: {
                id,
            },
        });
        
        return res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully.",
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};