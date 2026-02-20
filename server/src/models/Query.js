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
            required: true,
            index: true
        },
        train_details: {
            train_name: String,
            station_code: String,
            station_name: String,
            arrival_time: String,
            departure_time: String,
            seq: Number,
            distance: String,
            source_station: String,
            source_station_name: String,
            destination_station: String,
            destination_station_name: String
        },
        category: {
            type: [String],
            required: true,
            trim: true
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
        },
        status_history: [
            {
                status: String,
                changed_by: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                changed_at: Date,
                remarks: String
            }
        ]
    },
    {
        timestamps: true
    }
);

// Indexes
querySchema.index({ user_location: "2dsphere" });
querySchema.index({ category: 1, priority_percentage: -1 });
querySchema.index({ createdAt: -1 });
querySchema.index({ status: 1, createdAt: -1 });
querySchema.index({ keywords: 1 });
querySchema.index({ train_number: 1, status: 1 });
querySchema.index({ departments: 1 });

export default mongoose.model("Query", querySchema);
