import { prisma } from "../db.js";

export const searchRestaurants = async (req, res) => {
    try {
        const { keyword, city } = req.query;

        const restaurants = await prisma.restaurant.findMany({
            where: {
                isOpen: true,
                AND: [
                    keyword
                        ? {
                            OR: [
                                {
                                    name: {
                                        contains: keyword,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    description: { 
                                        contains: keyword, 
                                        mode: "insensitive",
                                    },
                                },
                            ],
                          }
                        : {},
                    city
                        ? {
                            city: {
                                contains: city,
                                mode: "insensitive",
                            },
                          }
                        : {},
                ],
            },
            orderBy: {
                rating: "desc",
            },
            include: {
                categories: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            totalResults: restaurants.length,
            restaurants,
        });

    } catch (error) {
        console.error("Search Restaurant Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const searchFoods = async (req, res) => {
    try {
        const { keyword, categoryId, restaurantId, minPrice, maxPrice } = req.query;

        const foods = await prisma.food.findMany({
            where: {
                isAvailable: true,
                AND: [
                    keyword
                        ? {
                            OR: [
                                {
                                    name: {
                                        contains: keyword, 
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    description: {
                                        contains: keyword, 
                                        mode: "insensitive",
                                    }
                                }
                            ],
                          }
                        : {},

                    categoryId ? { categoryId } : {},
                    restaurantId ? { restaurantId } : {},
                    minPrice || maxPrice
                        ? {
                            price: {
                                ...(minPrice && { gte: Number(minPrice) }),
                                ...(maxPrice && { lte: Number(maxPrice) }), 
                            },
                          }
                        : {},
                ],
            },
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
                        rating: true,
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

        res.status(200).json({
            success: true,
            totalResults: foods.length,
            foods,
        });
    } catch (error) {
        console.error("Search Food Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getPopularRestaurant = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({ // Fixed variable name restaurant -> restaurants
            where: {
                isOpen: true,
            },
            orderBy: [
                {
                    rating: "desc",
                },
                {
                    totalReview: "desc"
                },
            ],
            take: 10,
        });

        res.status(200).json({
            success: true, // Fixed succcess -> success
            restaurants,
        });
    } catch (error) {
        console.error("Popular Restaurants Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getPopularFoods = async (req, res) => {
    try {
        const foods = await prisma.food.findMany({
            where: {
                isAvailable: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        rating: true,
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

        res.status(200).json({
            success: true,
            foods,
        });
    } catch (error) {
        console.error("Popular Foods Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};