import Query from "../../models/Query.js";
import { asyncHandler, sendResponse, uploadOnCloudinary } from "../../utils/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Check if train is running based on schedule and current time
export const checkTrainRunningStatus = (trainSchedule) => {
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

export const analyzeWithGemini = async (description, imageUrls, trainSchedule, isTrainRunning) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        
        const currentTime = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });

        // Build content parts - combine text and images
        const parts = [];

        // Add text prompt
        const prompt = `
You are a railway complaint analysis system. Analyze the following passenger query and provide structured JSON output with accurate priority scoring.

Current Time: ${currentTime}

Train Details:
- Train No: ${trainSchedule?.train_no || "N/A"}
- Train Name: ${trainSchedule?.train_name || "N/A"}
- Current Station: ${trainSchedule?.station_name || "N/A"} (${trainSchedule?.station_code || "N/A"})
- Arrival Time: ${trainSchedule?.arrival_time || "N/A"}
- Departure Time: ${trainSchedule?.departure_time || "N/A"}
- Source: ${trainSchedule?.source_station_name || "N/A"} (${trainSchedule?.source_station || "N/A"})
- Destination: ${trainSchedule?.destination_station_name || "N/A"} (${trainSchedule?.destination_station || "N/A"})
- Distance: ${trainSchedule?.distance || "N/A"} km
- Sequence No: ${trainSchedule?.seq || "N/A"}

Is Train Currently Running: ${isTrainRunning ? "YES" : "NO"}

User Description: "${description}"

CRITICAL PRIORITY SCORING GUIDELINES (0-100 scale):

TRAIN IS RUNNING:
- 90-100: Life-threatening emergencies (heart attack, severe bleeding, unconscious person, fire, major accident, active assault/harassment requiring immediate intervention)
- 80-89: Serious safety/security issues (theft, weapon threat, drunk/violent passenger, medical emergency needing attention, security threat)
- 70-79: Important but not life-threatening (AC not working in hot weather, broken toilet, food poisoning symptoms, harassment complaint)
- 60-69: Moderate inconvenience (dirty coach, poor food quality, delayed service, minor technical issues)
- 50-59: Low-moderate issues (noise complaint, seat issues, general cleanliness)
- 30-49: Minor complaints (preference issues, general feedback)

TRAIN IS NOT RUNNING:
- 85-95: Critical safety/security issues that need immediate attention even if train not running (reported crime, safety hazard, security threat)
- 70-84: Serious issues requiring prompt response (medical emergency, harassment report, theft report)
- 50-69: Important issues (booking problems, refund requests, schedule inquiries)
- 30-49: Routine inquiries (general information, feedback, non-urgent complaints)
- 10-29: Low priority (general questions, suggestions)

IMPORTANT: 
- Be STRICT with high priorities (90+). Only use for genuine emergencies.
- Most routine complaints should be 30-60 range.
- Consider the actual severity, not just keywords.
- If unsure, err on the side of lower priority.

Respond with a valid JSON object with the following structure:
{
  "categories": ["category1", "category2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "department": "department_name",
  "priority_score": 0-100,
  "priority_analysis": "brief explanation of why this priority score was assigned",
  "is_urgent": true/false
}

Example outputs:
- "Medical emergency, passenger unconscious" → priority_score: 95, is_urgent: true
- "AC not working, very hot" → priority_score: 72, is_urgent: false
- "Dirty toilet" → priority_score: 58, is_urgent: false
- "Want refund for cancelled ticket" → priority_score: 45, is_urgent: false
- "General inquiry about schedule" → priority_score: 25, is_urgent: false
`;

        parts.push({ text: prompt });

        // Add images if provided - for now, we'll use image URLs in the text prompt
        // Note: For production, you may want to fetch and convert images to base64
        if (imageUrls.length > 0) {
            parts.push({ text: `\nImages provided: ${imageUrls.join(", ")}` });
        }

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON response
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (parseError) {
            // Try to extract JSON from markdown code blocks if present
            const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1]);
            } else {
                throw parseError;
            }
        }
        
        // Validate priority_score if present
        if (parsed.priority_score !== undefined) {
            const score = Number(parsed.priority_score);
            if (isNaN(score) || score < 0 || score > 100) {
                console.warn(`Invalid priority_score from Gemini: ${parsed.priority_score}, will use calculation`);
                delete parsed.priority_score;
            } else {
                parsed.priority_score = Math.round(score);
                console.log(`Gemini provided priority_score: ${parsed.priority_score} for description: "${description.substring(0, 50)}..."`);
            }
        } else {
            console.log(`Gemini did not provide priority_score, will use calculation for: "${description.substring(0, 50)}..."`);
        }
        
        return parsed;
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

// Calculate Priority Percentage
// Uses Gemini's priority_score if available, otherwise falls back to calculation
export const calculatePriority = (isTrainRunning, geminiAnalysis, description) => {
    // If Gemini provided a priority_score, use it (with validation)
    if (geminiAnalysis.priority_score !== undefined && geminiAnalysis.priority_score !== null) {
        const geminiPriority = Number(geminiAnalysis.priority_score);
        // Validate and use Gemini's score if reasonable
        if (!isNaN(geminiPriority) && geminiPriority >= 0 && geminiPriority <= 100) {
            const finalPriority = Math.round(geminiPriority);
            console.log(`Using Gemini priority_score: ${finalPriority} (train running: ${isTrainRunning})`);
            return finalPriority;
        } else {
            console.warn(`Invalid Gemini priority_score: ${geminiAnalysis.priority_score}, falling back to calculation`);
        }
    } else {
        console.log(`No Gemini priority_score, calculating priority (train running: ${isTrainRunning})`);
    }

    // Fallback calculation if Gemini didn't provide priority_score
    let basePriority = 50;

    // Keywords indicating high urgency
    const urgentKeywords = [
        "medical emergency",
        "unconscious",
        "heart attack",
        "bleeding",
        "dying",
        "accident",
        "fire",
        "assault",
        "molestation"
    ];
    const highKeywords = [
        "theft",
        "security",
        "safety",
        "fight",
        "dangerous",
        "weapon",
        "harassment",
        "police"
    ];
    const mediumKeywords = [
        "cleanliness",
        "dirty",
        "toilet",
        "food",
        "catering",
        "ac",
        "water",
        "cooling",
        "broken"
    ];
    const lowKeywords = [
        "inquiry",
        "question",
        "information",
        "refund",
        "booking",
        "schedule",
        "general"
    ];

    const descLower = description.toLowerCase();
    
    // Check for exact phrase matches first (more accurate)
    const hasUrgent = urgentKeywords.some((k) => descLower.includes(k.toLowerCase()));
    const hasHigh = highKeywords.some((k) => descLower.includes(k.toLowerCase()));
    const hasMedium = mediumKeywords.some((k) => descLower.includes(k.toLowerCase()));
    const hasLow = lowKeywords.some((k) => descLower.includes(k.toLowerCase()));

    // Check if Gemini marked it as urgent
    const geminiUrgent = geminiAnalysis.is_urgent === true;

    if (isTrainRunning) {
        // Train is running - higher base priority
        if (hasUrgent || geminiUrgent) {
            basePriority = 90; // Life-threatening emergencies
        } else if (hasHigh) {
            basePriority = 80; // Serious safety/security
        } else if (geminiAnalysis.categories?.includes("medical")) {
            basePriority = 85;
        } else if (geminiAnalysis.categories?.includes("security")) {
            basePriority = 80;
        } else if (hasMedium) {
            basePriority = 65; // Moderate inconvenience
        } else if (hasLow) {
            basePriority = 40; // Low priority
        } else {
            basePriority = 55; // Default moderate
        }
    } else {
        // Train not running - lower base priority
        if (hasUrgent || geminiUrgent) {
            basePriority = 85; // Critical even if train not running
        } else if (hasHigh) {
            basePriority = 70; // Serious but train not running
        } else if (geminiAnalysis.categories?.includes("medical") || geminiAnalysis.categories?.includes("security")) {
            basePriority = 65;
        } else if (hasMedium) {
            basePriority = 45; // Moderate
        } else if (hasLow) {
            basePriority = 25; // Low priority
        } else {
            basePriority = 35; // Default low-moderate
        }
    }

    // Cap at 100
    const finalPriority = Math.min(100, Math.max(0, basePriority));
    console.log(`Calculated priority: ${finalPriority} (train running: ${isTrainRunning}, description: "${description.substring(0, 50)}...")`);
    return finalPriority;
};

// Create Query
export const createQuery = asyncHandler(async (req, res) => {
    const {
        description,
        train_schedule, // Full train schedule object from dropdown
        train_number, // Train number (if train_schedule not provided)
        station_code, // Station code
        source
    } = req.body;

    const user_id = req.user._id; // From JWT middleware

    // Validate train_schedule or train_number
    if (!train_schedule && !train_number) {
        return sendResponse(res, false, null, "Train schedule or train number is required", 400);
    }
    
    // If train_schedule not provided but train_number is, we need to fetch it
    // For now, require train_schedule to be provided
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
        source,
        train_number: train_schedule.train_no,
        station_code: station_code || train_schedule.station_code || null,
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
