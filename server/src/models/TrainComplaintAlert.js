import mongoose from "mongoose";

const nextStationSchema = new mongoose.Schema(
    {
        station_code: {
            type: String,
            trim: true
        },
        station_name: {
            type: String,
            trim: true
        },
        seq: {
            type: Number
        }
    },
    { _id: false }
);

const complaintSummarySchema = new mongoose.Schema(
    {
        query_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Query"
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        description: {
            type: String,
            trim: true
        },
        image_urls: [
            {
                type: String,
                trim: true
            }
        ],
        station_code: {
            type: String,
            trim: true
        },
        created_at: {
            type: Date
        }
    },
    { _id: false }
);

const trainComplaintAlertSchema = new mongoose.Schema(
    {
        train_number: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        threshold: {
            type: Number,
            required: true
        },
        window_minutes: {
            type: Number,
            required: true
        },
        unique_users_count: {
            type: Number,
            required: true
        },
        total_complaints_count: {
            type: Number,
            required: true
        },
        station_code: {
            type: String,
            trim: true,
            default: null
        },
        next_stations: [nextStationSchema],
        complaint_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Query"
            }
        ],
        complaint_summaries: [complaintSummarySchema],
        image_urls: [
            {
                type: String,
                trim: true
            }
        ],
        sms_phone: {
            type: String,
            trim: true
        },
        sms_provider: {
            type: String,
            default: "textbelt"
        },
        sms_message: {
            type: String
        },
        sms_status: {
            type: String,
            enum: ["sent", "failed", "skipped"],
            default: "skipped"
        },
        sms_response: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        sms_error: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

trainComplaintAlertSchema.index({ createdAt: -1 });
trainComplaintAlertSchema.index({ train_number: 1, createdAt: -1 });

export default mongoose.model("TrainComplaintAlert", trainComplaintAlertSchema);
