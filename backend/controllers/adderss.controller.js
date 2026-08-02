import { prisma } from "../db.js";

export const createAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            street,
            city,
            state,
            postalCode,
            country,
            isDefault,
        } = req.body;

        if (!fullName || !phone || !street || !city) {
            return res.status(400).json({
                success: false,
                message: "Full name, phone, street and city are required.",
            });
        }

        if (isDefault === true || isDefault === "true") {
            await prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false },
            });
        }

        const address = await prisma.address.create({
            data: {
                userId: req.user.id,
                fullName,
                phone,
                street,
                city,
                state,
                postalCode,
                country: country || "Nepal",
                isDefault: isDefault === true || isDefault === "true",
            },
        });

        return res.status(201).json({
            success: true,
            message: "Address created successfully.",
            address,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAddress = async (req, res) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            success: true,
            totalAddresses: addresses.length,
            addresses,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await prisma.address.findUnique({
            where: { id },
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this address.",
            });
        }

        const {
            fullName,
            phone,
            street,
            city,
            state,
            postalCode,
            country,
            isDefault,
        } = req.body;

        if (isDefault === true || isDefault === "true") {
            await prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false },
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: {
                fullName,
                phone,
                street,
                city,
                state,
                postalCode,
                country,
                isDefault: isDefault === true || isDefault === "true",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Address updated successfully.",
            address: updatedAddress,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await prisma.address.findUnique({
            where: { id },
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this address.",
            });
        }

        await prisma.address.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: "Address Deleted successfully.",
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await prisma.address.findUnique({
            where: { id },
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this address.",
            });
        }

        await prisma.address.updateMany({
            where: { userId: req.user.id },
            data: { isDefault: false },
        });

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: { isDefault: true },
        });

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully.",
            address: updatedAddress,
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};