import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
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
        station: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ["admin", "super admin", "user"],
            default: "user"
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ station: 1 }); // optional, for filtering by station

export default mongoose.model("User", userSchema);
