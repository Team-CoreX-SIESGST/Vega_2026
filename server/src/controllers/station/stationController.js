import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { asyncHandler, sendResponse } from "../../utils/index.js";

// Get current file's directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to stations.json (adjust if placed elsewhere)
const stationsPath = path.join(__dirname, "../data/stations.json");

// Cache stations data in memory
let stationsCache = null;

// Load stations from file (synchronous once at startup, or lazy load)
const loadStations = () => {
    if (!stationsCache) {
        try {
            const rawData = fs.readFileSync(stationsPath, "utf8");
            stationsCache = JSON.parse(rawData);
            console.log(`Loaded ${stationsCache.length} stations`);
        } catch (error) {
            console.error("Failed to load stations:", error);
            stationsCache = [];
        }
    }
    return stationsCache;
};

// GET /api/stations
export const getStations = asyncHandler(async (req, res) => {
    const stations = loadStations();
    return sendResponse(res, true, { stations }, "Stations retrieved successfully", 200);
});
