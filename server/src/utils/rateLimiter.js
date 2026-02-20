// utils/rateLimiter.js
import rateLimit from "express-rate-limit";

export const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each user to 10 requests per minute
    message: {
        success: false,
        message: "Too many chat requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});
