import { asyncHandler, sendResponse } from "../../utils/index.js";
import { getTrainByNumber } from "../train/trainController.js";
import Complaint from "../../models/Complaint.js";
import axios from "axios";

// GET /api/mobile/train/:trainNumber — validate train and return name + zone
export const getTrain = asyncHandler(async (req, res) => {
    const { trainNumber } = req.params;
    const train = getTrainByNumber(trainNumber);
    if (!train) {
        return sendResponse(res, false, null, "Train number not found", 404);
    }
    return sendResponse(res, true, { train }, "Train found", 200);
});

// POST /api/mobile/complaint — create complaint (optionally classify via NLP)
export const createComplaint = asyncHandler(async (req, res) => {
    const { trainNumber, complaintText } = req.body;
    const userId = req.user._id;

    if (!complaintText || !complaintText.trim()) {
        return sendResponse(res, false, null, "Complaint text is required", 400);
    }

    let category = "General";
    let severity = "Normal";
    let assignedDepartment = "General";

    const nlppyUrl = process.env.NLPPY_URL || process.env.NLP_URL;
    if (nlppyUrl && complaintText.trim()) {
        try {
            const { data } = await axios.post(
                `${nlppyUrl.replace(/\/$/, "")}/classify`,
                { complaint_text: complaintText.trim(), train_number: trainNumber || null },
                { timeout: 5000 }
            );
            if (data?.department) assignedDepartment = data.department;
        } catch (err) {
            console.warn("NLP classify failed, using defaults:", err?.message);
        }
    }

    const complaint = await Complaint.create({
        user: userId,
        trainNumber: trainNumber || null,
        complaintText: complaintText.trim(),
        category,
        severity,
        assignedDepartment,
        status: "Pending",
    });

    const complaintData = complaint.toObject();
    return sendResponse(res, true, { complaint: complaintData }, "Complaint submitted", 201);
});

// GET /api/mobile/complaints — list complaints for current user
export const getComplaints = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const complaints = await Complaint.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();
    return sendResponse(res, true, { complaints }, "Complaints retrieved", 200);
});
