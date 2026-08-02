import jwt from "jsonwebtoken";

export const generateToken = (userID) => {
    return jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' });
};