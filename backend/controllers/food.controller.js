import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import { prisma } from "../db.js";

export const createFood = async (req, res) => {
    try {
        const { name, description, price, restaurantId, categoryId } = req.body;
        
        if (!name || !price || !restaurantId || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Name, price, restaurantId and categoryId are required.",
            });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: {
                id: restaurantId,
            },
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

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category || category.restaurantId !== restaurantId) {
            return res.status(400).json({
                success: false,
                message: "Invalid category for this restaurant.",
            });
        }

        const slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true,
        });

        const existingFood = await prisma.food.findUnique({
            where: {
                slug_restaurantId: {
                    slug,
                    restaurantId,
                }
            },
        });

        if (existingFood) {
            return res.status(400).json({
                success: false,
                message: "Food already exists in this restaurant.",
            });
        }

        let imageUrl = null;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "food-delivery/foods",
                resource_type: "image",
            });

            imageUrl = result.secure_url;
        }

        const food = await prisma.food.create({
            data: {
                name,
                slug,
                description,
                price: Number(price),
                image: imageUrl,
                restaurantId,
                categoryId,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Food created successfully.",
            food,
        });
    } catch (error) {
        console.error("Create Food Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllFood = async (req, res) => {
    try {
        const foods = await prisma.food.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        city: true,
                        isOpen: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            totalFood: foods.length,
            foods,
        });
    } catch (error) {
        console.error("Get All Food Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSingleFood = async (req, res) => {
    try {
        const { slug } = req.params;

        const food = await prisma.food.findFirst({
            where: { slug },
            include: {
                restaurant: true,
                category: true,
            },
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found.",
            });
        }

        return res.status(200).json({
            success: true,
            food,
        });
    } catch (error) {
        console.error("Get Single Food Error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getFoodsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const foods = await prisma.food.findMany({
            where: {
                categoryId,
                isAvailable: true,
            },
            orderBy: { createdAt: "desc" },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        city: true,
                        isOpen: true,
                    },
                },
                category: true,
            },
        });

        return res.status(200).json({
            success: true,
            totalFood: foods.length,
            foods,
        });
    } catch (error) {
        console.error("Get Food By Category Error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getFoodsByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const foods = await prisma.food.findMany({
            where: {
                restaurantId,
                isAvailable: true,
            },
            orderBy: { createdAt: "desc" },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            totalFood: foods.length,
            foods,
        });
    } catch (error) {
        console.error("Get Food By Restaurant Error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, categoryId, isAvailable } = req.body;

        const food = await prisma.food.findUnique({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found.",
            });
        }

        if (food.restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this food.",
            });
        }

        let imageUrl = food.image;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "food-delivery/foods",
                resource_type: "image",
            });
            imageUrl = result.secure_url;
        }

        const updateData = {
            image: imageUrl,
        };

        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name, {
                lower: true,
                strict: true,
                trim: true,
            });
        }

        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = Number(price);

        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: categoryId },
            });

            if (!category || category.restaurantId !== food.restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category for this restaurant.",
                });
            }

            updateData.categoryId = categoryId;
        }

        if (isAvailable !== undefined) {
            updateData.isAvailable = isAvailable === "true" || isAvailable === true;
        }

        const updatedFood = await prisma.food.update({
            where: { id },
            data: updateData,
        });

        return res.status(200).json({
            success: true,
            message: "Food updated successfully.",
            food: updatedFood,
        });
    } catch (error) {
        console.error("Update Food Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;

        const food = await prisma.food.findUnique({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found.",
            });
        }

        if (food.restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this food.",
            });
        }

        await prisma.food.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: "Food deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Food Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};