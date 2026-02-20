import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { asyncHandler, sendResponse } from "../../utils/index.js";
// If using csv-parser, uncomment:
// import csv from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the CSV file
const trainCsvPath = path.join(__dirname, "../../data/Train_details_22122017.csv");

let trainsCache = null;

// Manual CSV parser (simple split, assumes no commas in fields)
const parseCsvLine = (line) => line.split(",").map((field) => field.trim());

// Load trains from CSV (synchronous, cached)
const loadTrains = () => {
    if (!trainsCache) {
        try {
            const rawData = fs.readFileSync(trainCsvPath, "utf8");
            const lines = rawData.split("\n").filter((line) => line.trim() !== "");

            // First line is header
            const headers = parseCsvLine(lines[0]);

            // Parse remaining lines
            trainsCache = lines.slice(1).map((line) => {
                const values = parseCsvLine(line);
                // Build object with header keys
                return headers.reduce((obj, key, index) => {
                    obj[key] = values[index] || null; // handle missing values
                    return obj;
                }, {});
            });

            console.log(`Loaded ${trainsCache.length} train records`);
        } catch (error) {
            console.error("Failed to load trains CSV:", error);
            trainsCache = [];
        }
    }
    return trainsCache;
};

// GET /api/trains
export const getTrains = asyncHandler(async (req, res) => {
    const trains = loadTrains();
    return sendResponse(res, true, { trains }, "Trains retrieved successfully", 200);
});
