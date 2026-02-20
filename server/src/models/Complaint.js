import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        trainNumber: {
            type: String,
            default: null,
            trim: true,
        },
        complaintText: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
            default: "General",
        },
        severity: {
            type: String,
            enum: ["Low", "Normal", "High", "Critical"],
            default: "Normal",
        },
        assignedDepartment: {
            type: String,
            required: true,
            trim: true,
            default: "General",
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved"],
            default: "Pending",
            index: true,
        },
    },
    { timestamps: true }
);

complaintSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Complaint", complaintSchema);
