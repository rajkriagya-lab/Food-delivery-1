import slugify from "slugify";
import { prisma } from "../db.js";
import { v2 as cloudinary } from "cloudinary";

export const createCategory = async (req, res) => {
    try {
        const { name, restaurantId } = req.body;

        if (!name || !restaurantId) {
            return res.status(400).json({
                success: false,
                message: "Name and restaurantId are required.",
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

        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to add category to this restaurant.",
            });
        }

        const slug = slugify(name, {
            lower: true,
            strict: true,
            trim: true,
        });

        const existingCategory = await prisma.category.findUnique({
            where: {
                slug_restaurantId: {
                    slug,
                    restaurantId,
                },
            },
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists for this restaurant.",
            });
        }

        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "food-delivery/categories",
                resource_type: "image",
            });
            imageUrl = result.secure_url;
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                restaurantId,
                image: imageUrl,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category,
        });
    } catch (error) {
        console.error("Create category Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                createdAt: "desc",
            },
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
            },
        });
        return res.status(200).json({
            success: true,
            totalCategories: categories.length,
            categories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getResturantCategories = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const categories = await prisma.category.findMany({
            where: { restaurantId },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updatecategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        if (category.restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this category.",
            });
        }

        let imageUrl = category.image;

        if (req.file) {
            const imageUploader = await cloudinary.uploader.upload(req.file.path, {
                folder: "food-delivery/categories",
            });

            imageUrl = imageUploader.secure_url;
        }

        const updateData = {
            image: imageUrl,
        };

        if (name) {
            const slug = slugify(name, {
                lower: true,
                strict: true,
                trim: true,
            });

            updateData.name = name;
            updateData.slug = slug;
        }

        const updateCategory = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category: updateCategory,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                restaurant: true,
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        if (category.restaurant.ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this category.",
            });
        }

        await prisma.category.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};