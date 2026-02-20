import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler, sendResponse } from "../../utils/index.js";
// Notification helper removed – no longer needed

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
};

// Register User
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, station, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return sendResponse(res, false, null, "User already exists with this email", 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        station: station || null,
        role: role || "user"
    });

    // Generate token
    const token = generateToken(user._id);

    // Prepare user data for response (remove password)
    const userData = user.toObject();
    delete userData.password;

    return sendResponse(res, true, { user: userData, token }, "Registration successful", 201);
});

// Login User
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        return sendResponse(res, false, null, "Invalid email or password", 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return sendResponse(res, false, null, "Invalid email or password", 401);
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user data for response
    const userData = user.toObject();
    delete userData.password;

    return sendResponse(res, true, { user: userData, token }, "Login successful", 200);
});

// Check Authentication
export const checkAuth = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return sendResponse(res, false, null, "No token provided", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return sendResponse(res, false, null, "User not found", 404);
        }

        return sendResponse(res, true, { user }, "Authentication successful", 200);
    } catch (error) {
        return sendResponse(res, false, null, "Invalid or expired token", 401);
    }
});

// Logout (optional – token invalidation would need a blacklist)
export const logout = asyncHandler(async (req, res) => {
    return sendResponse(res, true, null, "Logout successful", 200);
});

// Note: updateSettings and getSettings are removed because notification preferences are gone.
// If you need a generic settings update endpoint, you can add one later.
