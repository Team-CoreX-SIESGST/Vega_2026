import Query from "../../models/Query.js";
import { asyncHandler, sendResponse, uploadOnCloudinary } from "../../utils/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Check if train is running based on schedule and current time
const checkTrainRunningStatus = (trainSchedule) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    // Parse arrival and departure times (format: "HH:MM" or "HH:MM:SS")
    const parseTime = (timeStr) => {
        if (!timeStr || timeStr === "NA" || timeStr === "Destination") return null;
        const parts = timeStr.split(":");
        if (parts.length >= 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return null;
    };

    const arrivalTime = parseTime(trainSchedule.arrival_time);
    const departureTime = parseTime(trainSchedule.departure_time);

    // If we have valid times, check if current time is between arrival and departure
    if (arrivalTime !== null && departureTime !== null) {
        // Handle overnight trains (departure < arrival)
        if (departureTime < arrivalTime) {
            // Train runs overnight
            return currentTime >= arrivalTime || currentTime <= departureTime;
        } else {
            // Normal same-day train
            return currentTime >= arrivalTime && currentTime <= departureTime;
        }
    }

    // If no specific times, assume it's a long-distance train currently running
    // based on source-destination logic
    return true; // Default to running if unsure (safer for priority)
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analyzeWithGemini = async (description, imageUrls, trainSchedule, isTrainRunning) => {
    try {
        const currentTime = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });

        // Build content parts - combine text and images
        const contents = [];

        // Add text prompt
        const prompt = `
You are a railway complaint analysis system. Analyze the following passenger query and provide structured output.

Current Time: ${currentTime}

Train Details:
- Train No: ${trainSchedule.train_no || "N/A"}
- Train Name: ${trainSchedule.train_name || "N/A"}
- Current Station: ${trainSchedule.station_name} (${trainSchedule.station_code})
- Arrival Time: ${trainSchedule.arrival_time || "N/A"}
- Departure Time: ${trainSchedule.departure_time || "N/A"}
- Source: ${trainSchedule.source_station_name} (${trainSchedule.source_station})
- Destination: ${trainSchedule.destination_station_name} (${trainSchedule.destination_station})
- Distance: ${trainSchedule.distance || "N/A"} km
- Sequence No: ${trainSchedule.seq || "N/A"}

Is Train Currently Running: ${isTrainRunning ? "YES" : "NO"}

User Description: "${description}"

Instructions for Priority Analysis:
- If train is RUNNING and issue is urgent (medical, security, safety, harassment, accident), priority should be HIGH (80-100)
- If train is RUNNING and issue is moderate (cleanliness, food quality, AC not working), priority should be MEDIUM-HIGH (60-80)
- If train is NOT RUNNING, only assign HIGH priority (70-100) if CRITICAL (safety, security, medical emergency, accident, harassment)
- If train is NOT RUNNING and issue is routine (booking, refund, inquiry), priority should be LOW-MEDIUM (20-50)
`;

        contents.push(prompt);

        // Add images if provided (Gemini can analyze images directly from URLs in most cases)
        if (imageUrls.length > 0) {
            for (const imageUrl of imageUrls) {
                contents.push({
                    fileData: {
                        mimeType: "image/jpeg", // Adjust based on actual image type
                        fileUri: imageUrl
                    }
                });
            }
        }

        // Use structured output (JSON mode) with response schema
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash", // or "gemini-3-flash-preview" for latest
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        categories: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description:
                                "Relevant categories (cleanliness, security, food, medical, technical, staff_behavior, infrastructure, delay, booking)"
                        },
                        keywords: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "5-10 relevant keywords for search"
                        },
                        department: {
                            type: Type.STRING,
                            description:
                                "Single most relevant department (cleaning, security, catering, medical, engineering, operations, customer_service, reservations, commercial)"
                        },
                        priority_analysis: {
                            type: Type.STRING,
                            description: "Brief explanation of urgency assessment"
                        },
                        is_urgent: {
                            type: Type.BOOLEAN,
                            description: "Whether this requires immediate attention"
                        }
                    },
                    required: [
                        "categories",
                        "keywords",
                        "department",
                        "priority_analysis",
                        "is_urgent"
                    ]
                }
            }
        });

        // Parse the JSON response directly
        const result = JSON.parse(response.text);
        return result;
    } catch (error) {
        console.error("Gemini analysis failed:", error);
        return {
            categories: ["general"],
            keywords: ["complaint", "railway", "issue", "train", "passenger"],
            department: "customer_service",
            priority_analysis: "Default fallback due to analysis error",
            is_urgent: false
        };
    }
};

// Example usage
async function main() {
    const trainSchedule = {
        train_no: "12345",
        train_name: "Rajdhani Express",
        station_name: "New Delhi",
        station_code: "NDLS",
        arrival_time: "16:00",
        departure_time: "16:30",
        source_station_name: "Mumbai Central",
        source_station: "MMCT",
        destination_station_name: "New Delhi",
        destination_station: "NDLS",
        distance: "1384",
        seq: "5"
    };

    const result = await analyzeWithGemini(
        "AC not working in coach B2, temperature is very high",
        [], // imageUrls
        trainSchedule,
        true // isTrainRunning
    );

    console.log(result);
}

main();

// Calculate Priority Percentage
const calculatePriority = (isTrainRunning, geminiAnalysis, description) => {
    let basePriority = 50;

    // Keywords indicating high urgency
    const urgentKeywords = [
        "medical",
        "emergency",
        "accident",
        "fire",
        "theft",
        "assault",
        "injury",
        "bleeding",
        "unconscious",
        "heart",
        "attack",
        "police",
        "harassment",
        "molestation",
        "dying"
    ];
    const highKeywords = [
        "security",
        "safety",
        "fight",
        "dangerous",
        "weapon",
        "drunk",
        "smoking",
        "chain pulling"
    ];
    const mediumKeywords = [
        "cleanliness",
        "dirty",
        "toilet",
        "food",
        "catering",
        "ac",
        "water",
        "cooling"
    ];

    const descLower = description.toLowerCase();
    const hasUrgent = urgentKeywords.some((k) => descLower.includes(k));
    const hasHigh = highKeywords.some((k) => descLower.includes(k));
    const hasMedium = mediumKeywords.some((k) => descLower.includes(k));

    // Check if Gemini marked it as urgent
    const geminiUrgent = geminiAnalysis.is_urgent === true;

    if (isTrainRunning) {
        // Train is running - higher base priority
        basePriority = 70;

        if (hasUrgent || geminiUrgent) basePriority = 95;
        else if (hasHigh) basePriority = 85;
        else if (geminiAnalysis.categories.includes("medical")) basePriority = 90;
        else if (geminiAnalysis.categories.includes("security")) basePriority = 85;
        else if (hasMedium) basePriority = 75;
        else basePriority = 70;
    } else {
        // Train not running - only high if critical
        if (hasUrgent || geminiUrgent) basePriority = 85;
        else if (hasHigh) basePriority = 75;
        else if (
            geminiAnalysis.categories.includes("medical") ||
            geminiAnalysis.categories.includes("security")
        )
            basePriority = 70;
        else if (hasMedium) basePriority = 50;
        else basePriority = 30; // Lower priority for non-running trains with routine issues
    }

    // Cap at 100
    return Math.min(100, Math.max(0, basePriority));
};

// Create Query
export const createQuery = asyncHandler(async (req, res) => {
    const {
        description,
        train_schedule, // Full train schedule object from dropdown
        source,
        user_location
    } = req.body;

    const user_id = req.user._id; // From JWT middleware

    // Validate train_schedule
    if (!train_schedule || !train_schedule.train_no) {
        return sendResponse(res, false, null, "Train schedule information is required", 400);
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

    // Determine if train is running based on schedule
    const isTrainRunning = checkTrainRunningStatus(train_schedule);

    // Analyze with Gemini
    const geminiAnalysis = await analyzeWithGemini(
        description,
        imageUrls,
        train_schedule,
        isTrainRunning
    );

    // Calculate priority
    const priority_percentage = calculatePriority(isTrainRunning, geminiAnalysis, description);

    // Create query
    const query = await Query.create({
        user_id,
        user_location: user_location
            ? {
                  type: "Point",
                  coordinates: user_location.coordinates // [longitude, latitude]
              }
            : undefined,
        source,
        train_number: train_schedule.train_no,
        train_details: {
            train_name: train_schedule.train_name,
            station_code: train_schedule.station_code,
            station_name: train_schedule.station_name,
            arrival_time: train_schedule.arrival_time,
            departure_time: train_schedule.departure_time,
            seq: train_schedule.seq,
            distance: train_schedule.distance,
            source_station: train_schedule.source_station,
            source_station_name: train_schedule.source_station_name,
            destination_station: train_schedule.destination_station,
            destination_station_name: train_schedule.destination_station_name
        },
        category: geminiAnalysis.categories,
        priority_percentage,
        description,
        keywords: geminiAnalysis.keywords,
        departments: [geminiAnalysis.department],
        status: "received"
    });

    return sendResponse(
        res,
        true,
        {
            query,
            train_running: isTrainRunning,
            analysis: geminiAnalysis,
            current_priority: priority_percentage
        },
        "Query created successfully",
        201
    );
});

// Get All Queries with Filters
export const getAllQueries = asyncHandler(async (req, res) => {
    const {
        user_id,
        status,
        category,
        keyword,
        search,
        train_number,
        department,
        min_priority,
        max_priority,
        is_running,
        page = 1,
        limit = 10,
        sortBy = "priority_percentage",
        sortOrder = "desc"
    } = req.query;

    // Build filter object
    const filter = {};

    if (user_id) filter.user_id = user_id;
    if (status) filter.status = status;
    if (train_number) filter.train_number = train_number;
    if (department) filter.departments = { $in: [department] };
    if (category) filter.category = { $in: [category] };
    if (keyword) filter.keywords = { $in: [keyword] };

    // Filter by train running status (based on stored train_details)
    if (is_running !== undefined) {
        // This would require a more complex check, skipping for now
    }

    // Search in description and train name
    if (search) {
        filter.$or = [
            { description: { $regex: search, $options: "i" } },
            { "train_details.train_name": { $regex: search, $options: "i" } },
            { keywords: { $in: [new RegExp(search, "i")] } }
        ];
    }

    // Priority range
    if (min_priority || max_priority) {
        filter.priority_percentage = {};
        if (min_priority) filter.priority_percentage.$gte = Number(min_priority);
        if (max_priority) filter.priority_percentage.$lte = Number(max_priority);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const queries = await Query.find(filter)
        .populate("user_id", "name email")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    const total = await Query.countDocuments(filter);

    return sendResponse(
        res,
        true,
        {
            queries,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalQueries: total,
                limit: Number(limit)
            }
        },
        "Queries fetched successfully",
        200
    );
});

// Get Single Query
export const getQueryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = await Query.findById(id).populate("user_id", "name email");

    if (!query) {
        return sendResponse(res, false, null, "Query not found", 404);
    }

    // Recalculate if train is running now (for real-time status)
    let currentRunningStatus = false;
    if (query.train_details) {
        currentRunningStatus = checkTrainRunningStatus(query.train_details);
    }

    return sendResponse(
        res,
        true,
        {
            query,
            train_currently_running: currentRunningStatus
        },
        "Query fetched successfully",
        200
    );
});

// Update Query (User can update their own, Admin can update any)
export const updateQuery = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, train_schedule, source } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const query = await Query.findById(id);

    if (!query) {
        return sendResponse(res, false, null, "Query not found", 404);
    }

    // Check permission
    if (
        query.user_id.toString() !== userId.toString() &&
        !["admin", "super_admin"].includes(userRole)
    ) {
        return sendResponse(res, false, null, "Not authorized to update this query", 403);
    }

    // Only allow updates if status is not closed/rejected
    if (["closed", "rejected"].includes(query.status)) {
        return sendResponse(res, false, null, "Cannot update closed or rejected queries", 400);
    }

    // Update fields
    if (description) query.description = description;
    if (source) query.source = source;

    // Update train details if provided
    if (train_schedule && train_schedule.train_no) {
        query.train_number = train_schedule.train_no;
        query.train_details = {
            train_name: train_schedule.train_name,
            station_code: train_schedule.station_code,
            station_name: train_schedule.station_name,
            arrival_time: train_schedule.arrival_time,
            departure_time: train_schedule.departure_time,
            seq: train_schedule.seq,
            distance: train_schedule.distance,
            source_station: train_schedule.source_station,
            source_station_name: train_schedule.source_station_name,
            destination_station: train_schedule.destination_station,
            destination_station_name: train_schedule.destination_station_name
        };

        // Recalculate priority with new train info
        const isTrainRunning = checkTrainRunningStatus(train_schedule);
        const geminiAnalysis = await analyzeWithGemini(
            description || query.description,
            [],
            train_schedule,
            isTrainRunning
        );
        query.priority_percentage = calculatePriority(
            isTrainRunning,
            geminiAnalysis,
            description || query.description
        );
        query.category = geminiAnalysis.categories;
        query.keywords = geminiAnalysis.keywords;
        query.departments = [geminiAnalysis.department];
    }

    await query.save();

    return sendResponse(res, true, { query }, "Query updated successfully", 200);
});

// Update Query Status (Admin/Super Admin only)
export const updateQueryStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const userId = req.user._id;

    const validStatuses = [
        "received",
        "assigned",
        "working_on",
        "hold",
        "pending_info",
        "escalated",
        "resolved",
        "closed",
        "rejected"
    ];

    if (!validStatuses.includes(status)) {
        return sendResponse(res, false, null, "Invalid status value", 400);
    }

    const query = await Query.findByIdAndUpdate(
        id,
        {
            status,
            $push: {
                status_history: {
                    status,
                    changed_by: userId,
                    changed_at: new Date(),
                    remarks: remarks || ""
                }
            }
        },
        { new: true }
    );

    if (!query) {
        return sendResponse(res, false, null, "Query not found", 404);
    }

    return sendResponse(res, true, { query }, "Status updated successfully", 200);
});

// Delete Query
export const deleteQuery = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const query = await Query.findById(id);

    if (!query) {
        return sendResponse(res, false, null, "Query not found", 404);
    }

    // Check permission: User can delete own, Admin can delete any
    if (
        query.user_id.toString() !== userId.toString() &&
        !["admin", "super_admin"].includes(userRole)
    ) {
        return sendResponse(res, false, null, "Not authorized to delete this query", 403);
    }

    await Query.findByIdAndDelete(id);

    return sendResponse(res, true, null, "Query deleted successfully", 200);
});
