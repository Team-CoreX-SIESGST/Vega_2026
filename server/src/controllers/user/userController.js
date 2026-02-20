import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler, sendResponse } from "../../utils/index.js";
import { createMainNotification } from "../../utils/notificationHelpers.js";

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
};

// Register User
export const register = asyncHandler(async (req, res) => {
    const { fullName, email, password, organization, teamSize, phone } = req.body;

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
        fullName,
        email,
        password: hashedPassword,
        organization: organization || null,
        teamSize: teamSize || null,
        phone: phone || null
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Prepare user data for response
    const userData = user.toObject();

    // Create main notification for new user registration (only if organization exists)
    if (organization && organization.trim()) {
        try {
            // Get the first admin user in the organization to be createdBy
            // Or use the new user themselves if no admin exists
            let createdByUserId = user._id;

            // Try to find an admin in the same organization
            const adminUser = await User.findOne({
                organization: organization,
            }).sort({ createdAt: 1 }); // Get the oldest admin

            if (adminUser) {
                createdByUserId = adminUser._id;
            }

            await createMainNotification(
                "New User Registered",
                `A new user ${fullName} has registered in your organization.`,
                "good",
                organization,
                createdByUserId
            );
        } catch (error) {
            console.error("Error creating notification for new user:", error);
            // Don't fail registration if notification fails
        }
    }

    return sendResponse(
        res,
        true,
        {
            user: userData,
            token
        },
        "Registration successful",
        201
    );
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

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Prepare user data for response
    const userData = user.toObject();

    return sendResponse(
        res,
        true,
        {
            user: userData,
            token
        },
        "Login successful",
        200
    );
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

// Update User Settings
export const updateSettings = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return sendResponse(res, false, null, "No token provided", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return sendResponse(res, false, null, "User not found", 404);
        }

        const { emailReminder, pushNotification, notificationSound } = req.body;

        // Update notification preferences
        if (emailReminder !== undefined) {
            user.notificationPreferences.emailReminder = emailReminder;
        }
        if (pushNotification !== undefined) {
            user.notificationPreferences.pushNotification = pushNotification;
        }
        if (notificationSound !== undefined) {
            user.notificationPreferences.notificationSound = notificationSound;
        }

        await user.save();

        // Prepare user data for response (without password)
        const userData = user.toObject();
        delete userData.password;

        return sendResponse(res, true, { user: userData }, "Settings updated successfully", 200);
    } catch (error) {
        return sendResponse(res, false, null, "Invalid or expired token", 401);
    }
});

// Get User Settings
export const getSettings = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return sendResponse(res, false, null, "No token provided", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select("notificationPreferences");

        if (!user) {
            return sendResponse(res, false, null, "User not found", 404);
        }

        return sendResponse(
            res,
            true,
            { settings: user.notificationPreferences },
            "Settings retrieved successfully",
            200
        );
    } catch (error) {
        return sendResponse(res, false, null, "Invalid or expired token", 401);
    }
});

// Logout (optional - token invalidation would need token blacklist)
export const logout = asyncHandler(async (req, res) => {
    // For JWT tokens, logout is handled client-side by removing token
    // If you need server-side logout, implement token blacklist
    return sendResponse(res, true, null, "Logout successful", 200);
});
