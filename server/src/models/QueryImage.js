import mongoose from "mongoose";

const queryImageSchema = new mongoose.Schema(
    {
        query_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Query",
            required: true,
            index: true
        },
        image_url: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("QueryImage", queryImageSchema);
