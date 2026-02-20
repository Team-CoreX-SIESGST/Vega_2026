import { asyncHandler, sendResponse, uploadOnCloudinary } from "../../utils/index.js";
import { getTrainByNumber, getTrainScheduleByNumber, getAllStationsForTrain } from "../train/trainController.js";
import Complaint from "../../models/Complaint.js";
import { analyzeWithGemini, checkTrainRunningStatus } from "../query/queryControllers.js";
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

// GET /api/mobile/train/:trainNumber/schedule — get train schedule by train number
export const getTrainSchedule = asyncHandler(async (req, res) => {
    const { trainNumber } = req.params;
    const { stationCode } = req.query; // Optional: filter by station code
    
    const schedule = getTrainScheduleByNumber(trainNumber, stationCode);
    if (!schedule) {
        return sendResponse(res, false, null, "Train schedule not found", 404);
    }
    return sendResponse(res, true, { schedule }, "Train schedule found", 200);
});

// GET /api/mobile/train/:trainNumber/stations — get all stations for a train
export const getTrainStations = asyncHandler(async (req, res) => {
    const { trainNumber } = req.params;
    const stations = getAllStationsForTrain(trainNumber);
    if (stations.length === 0) {
        return sendResponse(res, false, null, "Train stations not found", 404);
    }
    return sendResponse(res, true, { stations }, "Train stations found", 200);
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

// POST /api/mobile/complaint-with-gemini — create complaint with Gemini analysis and FastAPI classification
export const createComplaintWithGemini = asyncHandler(async (req, res) => {
    const {
        description,
        train_schedule, // Full train schedule object (optional - can be fetched from train_number)
        train_number, // Train number (if train_schedule not provided, fetch from CSV)
        station_code, // Station code
        source
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!description || !description.trim()) {
        return sendResponse(res, false, null, "Description is required", 400);
    }

    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadOnCloudinary(file.path);
            if (result) {
                imageUrls.push(result.secure_url);
            }
        }
    }

    // If train_schedule not provided but train_number is, fetch from CSV
    let finalTrainSchedule = train_schedule;
    if (!finalTrainSchedule && train_number) {
        finalTrainSchedule = getTrainScheduleByNumber(train_number, station_code);
        if (!finalTrainSchedule) {
            return sendResponse(res, false, null, `Train schedule not found for train number: ${train_number}`, 404);
        }
    }

    // Determine if train is running based on schedule (if provided)
    const isTrainRunning = finalTrainSchedule ? checkTrainRunningStatus(finalTrainSchedule) : false;

    // Step 1: Analyze with Gemini
    let geminiAnalysis = null;
    try {
        geminiAnalysis = await analyzeWithGemini(
            description,
            imageUrls,
            finalTrainSchedule || {},
            isTrainRunning
        );
    } catch (error) {
        console.error("Gemini analysis error:", error);
        geminiAnalysis = {
            categories: ["general"],
            keywords: ["complaint", "railway", "issue"],
            department: "customer_service",
            priority_analysis: "Analysis failed",
            is_urgent: false
        };
    }

    // Step 2: Send Gemini output to FastAPI classifier
    let fastApiResult = null;
    const nlppyUrl = process.env.NLPPY_URL || process.env.NLP_URL;
    if (nlppyUrl) {
        try {
            const { data } = await axios.post(
                `${nlppyUrl.replace(/\/$/, "")}/classify`,
                {
                    complaint_text: description.trim(),
                    category: geminiAnalysis.categories?.[0] || null,
                    priority: geminiAnalysis.is_urgent ? "high" : "normal",
                    train_number: finalTrainSchedule?.train_no || train_number || null
                },
                { timeout: 10000 }
            );
            fastApiResult = data;
        } catch (err) {
            console.warn("FastAPI classify failed:", err?.message);
            fastApiResult = {
                department: geminiAnalysis.department || "General",
                confidence: 0.5
            };
        }
    } else {
        // Fallback if FastAPI URL not configured
        fastApiResult = {
            department: geminiAnalysis.department || "General",
            confidence: 0.7
        };
    }

    // Return the analysis results
    return sendResponse(
        res,
        true,
        {
            gemini_analysis: geminiAnalysis,
            fastapi_classification: fastApiResult,
            train_running: isTrainRunning,
            images: imageUrls
        },
        "Complaint analyzed successfully",
        200
    );
});
