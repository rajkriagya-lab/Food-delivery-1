import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

export const protect = async (req, res, next) => { 
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userID },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};