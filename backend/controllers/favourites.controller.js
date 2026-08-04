import { prisma } from "../db.js";

export const toggelFavourites = async (req, res) => {
    try {
        const { foodId } = req.params; 

        const food = await prisma.food.findUnique({
            where: { id: foodId },
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food not found.", 
            });
        }

        const existingFavourite = await prisma.favourite.findUnique({
            where: {
                userId_foodId: {
                    userId: req.user.id,
                    foodId,
                },
            },
        });

        if (existingFavourite) {
            await prisma.favourite.delete({ 
                where: { id: existingFavourite.id },
            });
            return res.status(200).json({
                success: true,
                message: "Food removed from favorites.",
                isFavourites: false,
            });
        }

        const favourite = await prisma.favourite.create({
            data: {
                userId: req.user.id,
                foodId,            
            },
        });

        return res.status(200).json({
            success: true,
            message: "Food is added to favourites.",
            isFavourites: true,
            favourite,
        });
    } catch (error) {
        console.error("Toggle Favourites Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyFavourites = async (req, res) => {
    try {
        const favourites = await prisma.favourite.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                food: {
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
                },
            },
        });

        res.status(200).json({
            success: true,
            totalFavourites: favourites.length,
            favourites,
        });
    } catch (error) {
        console.error("Get Favourites Error:", error);

        res.status(500).json({
            success: false, 
            message: error.message,
        });
    }
};

export const removeFavourite = async (req, res) => { 
    try {
        const { foodId } = req.params;

        const favourite = await prisma.favourite.findUnique({ 
            where: {
                userId_foodId: {
                    userId: req.user.id,
                    foodId,
                },
            },
        });

        if (!favourite) {
            return res.status(404).json({
                success: false,
                message: "Favourite item not found.",
            });
        }

        await prisma.favourite.delete({
            where: { id: favourite.id },
        });

        res.status(200).json({
            success: true,
            message: "Food removed from favourites.",
        });
    } catch (error) {
        console.error("Remove Favourite Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};