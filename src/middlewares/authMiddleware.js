import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access - no token found"
            });
        }
        
        const decode = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decode._id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.status === "inactive") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive. Please contact administrator."
            });
        }

        req.user=user;

        next();

    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid token: " + error.message
        });
    }
}

export default authMiddleware;