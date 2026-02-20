import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        organization: {
            type: String,
            default: null
        },
        teamSize: {
            type: String,
            default: null
        },
        phone: {
            type: String,
            default: null
        },
        isVerified: {
            type: Boolean,
            default: true // For simplicity in hackathon, skip email verification
        },
        role: {
            type: String,
            enum: ["admin", "user", "manager"],
            default: "user"
        },
        notificationPreferences: {
            emailReminder: { type: Boolean, default: true },
            pushNotification: { type: Boolean, default: true },
            notificationSound: { type: Boolean, default: true }
        },
        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ organization: 1 });

export default mongoose.model("User", userSchema);
