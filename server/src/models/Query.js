import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        user_location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        source: {
            type: String,
            trim: true,
            lowercase: true,
            default: null
        },
        train_number: {
            type: String,
            default: null,
            index: true
        },
        category: {
            type: [String], // now an array of strings
            required: true,
            trim: true
            // enum removed
        },
        priority_percentage: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        keywords: [
            {
                type: String,
                trim: true
            }
        ],
        departments: [
            {
                type: String,
                trim: true
            }
        ],
        status: {
            type: String,
            enum: [
                "received",
                "assigned",
                "working_on",
                "hold",
                "pending_info",
                "escalated",
                "resolved",
                "closed",
                "rejected"
            ],
            default: "received",
            index: true
        }
    },
    {
        timestamps: true // adds createdAt and updatedAt automatically
    }
);

// Create a 2dsphere index for location-based queries
querySchema.index({ user_location: "2dsphere" });

// Additional compound indexes for common query patterns
// Note: category is now an array, so this creates a multikey index
querySchema.index({ category: 1, priority_percentage: -1 });
querySchema.index({ createdAt: -1 });
querySchema.index({ status: 1, createdAt: -1 }); // useful for filtering by status with recent first

export default mongoose.model("Query", querySchema);
