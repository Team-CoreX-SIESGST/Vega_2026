import mongoose from "mongoose";

// Main Notification Schema (Broadcast to all users)
const mainNotificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        notificationType: {
            type: String,
            enum: ["good", "normal", "alert"],
            default: "normal"
        },
        organization: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        expiryDate: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
    },
    {
        timestamps: true
    }
);

// User Notification Schema (Specific to individual users)
const userNotificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        isSeen: {
            type: Boolean,
            default: false
        },
        notificationType: {
            type: String,
            enum: ["good", "normal", "alert"],
            default: "normal"
        },
        organization: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
mainNotificationSchema.index({ organization: 1, isActive: 1, createdAt: -1 });
mainNotificationSchema.index({ createdBy: 1 });
mainNotificationSchema.index({ expiryDate: 1 });

userNotificationSchema.index({ user: 1, isSeen: 1, createdAt: -1 });
userNotificationSchema.index({ organization: 1 });
userNotificationSchema.index({ notificationType: 1 });

// Create models
export const MainNotification = mongoose.model("MainNotification", mainNotificationSchema);
export const UserNotification = mongoose.model("UserNotification", userNotificationSchema);
