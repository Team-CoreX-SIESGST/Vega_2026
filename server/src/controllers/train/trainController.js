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

/** Get one train by number (first row matching Train No). Returns { train_name, zone } or null. */
export function getTrainByNumber(trainNumber) {
    if (!trainNumber) return null;
    const trains = loadTrains();
    const normalized = String(trainNumber).trim();
    const row = trains.find((t) => String(t["Train No"] || "").trim() === normalized);
    if (!row) return null;
    return {
        train_name: row["Train Name"] || row["train_name"] || "Unknown",
        zone: row["Source Station Name"] || row["Source Station"] || "Indian Railways",
    };
}

/** Get train schedule by train number. Returns array of all stations for the train, or first station entry. */
export function getTrainScheduleByNumber(trainNumber, stationCode = null) {
    if (!trainNumber) return null;
    const trains = loadTrains();
    const normalized = String(trainNumber).trim();
    
    // Get all rows for this train number
    const trainRows = trains.filter((t) => String(t["Train No"] || "").trim() === normalized);
    if (trainRows.length === 0) return null;
    
    // If stationCode provided, find that specific station entry
    if (stationCode) {
        const stationRow = trainRows.find((t) => 
            String(t["Station Code"] || "").trim().toUpperCase() === String(stationCode).trim().toUpperCase()
        );
        if (stationRow) {
            return formatTrainScheduleRow(stationRow);
        }
    }
    
    // Return first station entry (or you could return all stations)
    const firstRow = trainRows[0];
    return formatTrainScheduleRow(firstRow);
}

/** Format a CSV row into train schedule object matching the expected format */
function formatTrainScheduleRow(row) {
    return {
        train_no: String(row["Train No"] || "").trim(),
        train_name: row["Train Name"] || row["train_name"] || "Unknown",
        station_name: row["Station Name"] || "",
        station_code: row["Station Code"] || "",
        arrival_time: row["Arrival time"] || row["Arrival Time"] || "",
        departure_time: row["Departure Time"] || row["Departure time"] || "",
        source_station: row["Source Station"] || "",
        source_station_name: row["Source Station Name"] || "",
        destination_station: row["Destination Station"] || "",
        destination_station_name: row["Destination Station Name"] || "",
        distance: row["Distance"] || "",
        seq: parseInt(row["SEQ"] || row["seq"] || "0", 10)
    };
}

/** Get all stations for a train number */
export function getAllStationsForTrain(trainNumber) {
    if (!trainNumber) return [];
    const trains = loadTrains();
    const normalized = String(trainNumber).trim();
    const trainRows = trains.filter((t) => String(t["Train No"] || "").trim() === normalized);
    return trainRows.map(formatTrainScheduleRow);
}
