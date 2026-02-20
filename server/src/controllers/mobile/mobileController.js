import { asyncHandler, sendResponse, uploadOnCloudinary } from "../../utils/index.js";
import { getTrainByNumber, getTrainScheduleByNumber, getAllStationsForTrain } from "../train/trainController.js";
import Query from "../../models/Query.js";
import { analyzeWithGemini, calculatePriority, checkTrainRunningStatus } from "../query/queryControllers.js";
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

// POST /api/mobile/complaint — create query (mobile complaint -> Query)
export const createComplaint = asyncHandler(async (req, res) => {
    const { train_number, station_code, description, complaintText, trainNumber, source } = req.body;
    // support legacy keys from older mobile form: trainNumber + complaintText
    const effectiveTrainNumber = train_number || trainNumber || null;
    const effectiveStationCode = station_code || null;
    const effectiveDescription = (description || complaintText || "").trim();

    if (!effectiveDescription) {
        return sendResponse(res, false, null, "Description is required", 400);
    }

    // Reuse the same flow as /complaint-with-gemini but without images
    let finalTrainSchedule = null;
    if (effectiveTrainNumber) {
        finalTrainSchedule = getTrainScheduleByNumber(effectiveTrainNumber, effectiveStationCode);
        if (!finalTrainSchedule) {
            return sendResponse(
                res,
                false,
                null,
                `Train schedule not found for train number: ${effectiveTrainNumber}`,
                404
            );
        }
    }

    const isTrainRunning = finalTrainSchedule ? checkTrainRunningStatus(finalTrainSchedule) : false;

    const geminiAnalysis = await analyzeWithGemini(
        effectiveDescription,
        [],
        finalTrainSchedule || {},
        isTrainRunning
    );

    const priority_percentage = calculatePriority(isTrainRunning, geminiAnalysis, effectiveDescription);

    // FastAPI classifier (optional)
    let fastApiResult = null;
    const nlppyUrl = process.env.NLPPY_URL || process.env.NLP_URL;
    if (nlppyUrl) {
        try {
            const { data } = await axios.post(
                `${nlppyUrl.replace(/\/$/, "")}/classify`,
                {
                    complaint_text: effectiveDescription,
                    category: geminiAnalysis.categories?.[0] || null,
                    priority: geminiAnalysis.is_urgent ? "high" : "normal",
                    train_number: finalTrainSchedule?.train_no || effectiveTrainNumber || null
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
        fastApiResult = {
            department: geminiAnalysis.department || "General",
            confidence: 0.7
        };
    }

    const query = await Query.create({
        user_id: req.user._id,
        source: source || "mobile",
        train_number: finalTrainSchedule?.train_no || effectiveTrainNumber || null,
        station_code: effectiveStationCode || finalTrainSchedule?.station_code || null,
        train_details: finalTrainSchedule
            ? {
                  train_name: finalTrainSchedule.train_name,
                  station_code: finalTrainSchedule.station_code,
                  station_name: finalTrainSchedule.station_name,
                  arrival_time: finalTrainSchedule.arrival_time,
                  departure_time: finalTrainSchedule.departure_time,
                  seq: finalTrainSchedule.seq,
                  distance: finalTrainSchedule.distance,
                  source_station: finalTrainSchedule.source_station,
                  source_station_name: finalTrainSchedule.source_station_name,
                  destination_station: finalTrainSchedule.destination_station,
                  destination_station_name: finalTrainSchedule.destination_station_name
              }
            : undefined,
        category: geminiAnalysis.categories,
        priority_percentage,
        description: effectiveDescription,
        keywords: geminiAnalysis.keywords,
        departments: [fastApiResult?.department || geminiAnalysis.department],
        status: "received"
    });

    return sendResponse(
        res,
        true,
        {
            query,
            gemini_analysis: geminiAnalysis,
            fastapi_classification: fastApiResult,
            train_running: isTrainRunning
        },
        "Query created successfully",
        201
    );
});

// GET /api/mobile/complaints — list mobile queries for current user (backwards-compatible route name)
export const getComplaints = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const queries = await Query.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .lean();
    return sendResponse(res, true, { queries }, "Queries retrieved", 200);
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

    // Calculate priority (Query schema expects this)
    const priority_percentage = calculatePriority(isTrainRunning, geminiAnalysis, description.trim());

    // Persist into Query (mobile complaint == Query)
    const query = await Query.create({
        user_id: userId,
        source: source || "mobile",
        train_number: finalTrainSchedule?.train_no || train_number || null,
        station_code: station_code || finalTrainSchedule?.station_code || null,
        train_details: finalTrainSchedule
            ? {
                  train_name: finalTrainSchedule.train_name,
                  station_code: finalTrainSchedule.station_code,
                  station_name: finalTrainSchedule.station_name,
                  arrival_time: finalTrainSchedule.arrival_time,
                  departure_time: finalTrainSchedule.departure_time,
                  seq: finalTrainSchedule.seq,
                  distance: finalTrainSchedule.distance,
                  source_station: finalTrainSchedule.source_station,
                  source_station_name: finalTrainSchedule.source_station_name,
                  destination_station: finalTrainSchedule.destination_station,
                  destination_station_name: finalTrainSchedule.destination_station_name
              }
            : undefined,
        category: geminiAnalysis.categories,
        priority_percentage,
        description: description.trim(),
        keywords: geminiAnalysis.keywords,
        departments: [fastApiResult?.department || geminiAnalysis.department],
        status: "received"
    });

    // Return the analysis results + stored query
    return sendResponse(
        res,
        true,
        {
            query,
            gemini_analysis: geminiAnalysis,
            fastapi_classification: fastApiResult,
            train_running: isTrainRunning,
            images: imageUrls
        },
        "Query created successfully",
        201
    );
});
