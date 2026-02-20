import axios from "axios";
import Query from "../models/Query.js";
import TrainComplaintAlert from "../models/TrainComplaintAlert.js";
import User from "../models/User.js";
import { getAllStationsForTrain } from "../controllers/train/trainController.js";
import bcrypt from "bcrypt";

const DEFAULT_SMS_PHONE = "+919082944120";

const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return fallback;
    return parsed;
};

const normalizeCode = (value) =>
    String(value || "")
        .trim()
        .toUpperCase();

const shortText = (value, maxLength = 72) => {
    const raw = String(value || "").replace(/\s+/g, " ").trim();
    if (!raw) return "No description";
    if (raw.length <= maxLength) return raw;
    return `${raw.slice(0, maxLength - 3)}...`;
};

const pickNextStations = (trainNumber, stationCode, maxStations = 3) => {
    const allStations = getAllStationsForTrain(trainNumber);
    if (!allStations.length) return [];

    const sorted = [...allStations].sort((a, b) => Number(a.seq || 0) - Number(b.seq || 0));
    const normalizedCurrent = normalizeCode(stationCode);
    const currentIndex = normalizedCurrent
        ? sorted.findIndex((row) => normalizeCode(row.station_code) === normalizedCurrent)
        : -1;

    const nextRows =
        currentIndex >= 0
            ? sorted.slice(currentIndex + 1, currentIndex + 1 + maxStations)
            : sorted.slice(0, maxStations);

    return nextRows.map((row) => ({
        station_code: row.station_code || "",
        station_name: row.station_name || "",
        seq: Number(row.seq || 0)
    }));
};

const toUniqueImageUrls = (complaints, maxCount = 5) => {
    const urls = [];
    const seen = new Set();

    for (const complaint of complaints) {
        const imageUrls = Array.isArray(complaint.image_urls) ? complaint.image_urls : [];
        for (const url of imageUrls) {
            if (!url || seen.has(url)) continue;
            seen.add(url);
            urls.push(url);
            if (urls.length >= maxCount) return urls;
        }
    }

    return urls;
};

const buildSmsMessage = ({
    trainNumber,
    uniqueUsersCount,
    windowMinutes,
    nextStations,
    complaintSummaries,
    imageUrls
}) => {
    const nextStationsText = nextStations.length
        ? nextStations.map((row) => row.station_code || row.station_name).join(", ")
        : "N/A";
    const issuesText = complaintSummaries.length
        ? complaintSummaries
              .slice(0, 2)
              .map((item, index) => `${index + 1}) ${shortText(item.description, 48)}`)
              .join(" ")
        : "N/A";
    const imageHint = imageUrls.length ? ` Img: ${imageUrls[0]}` : "";

    return `[RailMind Alert] Train ${trainNumber}: ${uniqueUsersCount} users reported complaints in last ${windowMinutes}m. Next stations: ${nextStationsText}. Issues: ${issuesText}.${imageHint}`;
};

const sendTextbeltSms = async ({
    phone,
    message,
    forceSend = false,
    skipSend = false
}) => {
    if (skipSend) {
        return {
            status: "skipped",
            response: { reason: "sms_skipped_by_request" },
            error: null
        };
    }

    const smsEnabled =
        String(process.env.TRAIN_COMPLAINT_SMS_ENABLED ?? "true").toLowerCase() !== "false";
    if (!forceSend && !smsEnabled) {
        return {
            status: "skipped",
            response: { reason: "sms_disabled" },
            error: null
        };
    }

    const endpoint = process.env.TEXTBELT_API_URL || "https://textbelt.com/text";
    const key = process.env.TEXTBELT_API_KEY || "textbelt";

    try {
        const body = new URLSearchParams();
        body.append("phone", phone);
        body.append("message", message);
        body.append("key", key);

        const { data } = await axios.post(endpoint, body.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 10000
        });

        return {
            status: data?.success ? "sent" : "failed",
            response: data ?? null,
            error: data?.success ? null : data?.error || "SMS provider returned failure"
        };
    } catch (error) {
        return {
            status: "failed",
            response: null,
            error: error?.response?.data?.error || error.message || "SMS provider error"
        };
    }
};

const ensureMockUsers = async (count) => {
    const userCount = Math.max(1, count);
    const passwordHash = await bcrypt.hash("mockpass123", 10);
    const users = [];

    for (let index = 0; index < userCount; index += 1) {
        const email = `mock.alert.user${index + 1}@railmind.local`;
        let user = await User.findOne({ email }).select("_id");

        if (!user) {
            user = await User.create({
                name: `Mock Alert User ${index + 1}`,
                email,
                password: passwordHash,
                role: "user",
                station: null
            });
        }

        users.push(user);
    }

    return users;
};

const toTrainDetails = (station = {}, trainNumber) => ({
    train_name: station.train_name || "Mock Train",
    station_code: station.station_code || null,
    station_name: station.station_name || null,
    arrival_time: station.arrival_time || null,
    departure_time: station.departure_time || null,
    seq: Number(station.seq || 0),
    distance: station.distance || null,
    source_station: station.source_station || null,
    source_station_name: station.source_station_name || null,
    destination_station: station.destination_station || null,
    destination_station_name: station.destination_station_name || null,
    train_no: trainNumber
});

export const seedTrainAlertMockData = async ({
    trainNumber = "107",
    complaintsCount,
    sendSms = false,
    forceAlert = false
} = {}) => {
    const normalizedTrain = String(trainNumber || "107").trim();
    const threshold = toPositiveInt(process.env.TRAIN_COMPLAINT_ALERT_THRESHOLD, 3);
    const count = Math.max(
        threshold + 2,
        toPositiveInt(complaintsCount, threshold + 2)
    );
    const windowMinutes = toPositiveInt(process.env.TRAIN_COMPLAINT_ALERT_WINDOW_MINUTES, 60);
    const stations = getAllStationsForTrain(normalizedTrain);
    const users = await ensureMockUsers(count);
    const runId = Date.now();
    const baselineTime = Date.now() - Math.max(1, windowMinutes - 1) * 60 * 1000;

    const samples = [
        "AC not working in coach and passengers are uncomfortable.",
        "Toilet is dirty and no water available in the compartment.",
        "Lights are flickering repeatedly causing inconvenience.",
        "Coach cleaning required urgently near berth area.",
        "Food quality is poor and service is delayed.",
        "Security concern due to suspicious activity in coach."
    ];

    const docs = [];

    for (let i = 0; i < count; i += 1) {
        const station = stations.length ? stations[i % stations.length] : {};
        const description = `${samples[i % samples.length]} [MOCK-ALERT-${runId}-${i + 1}]`;
        const createdAt = new Date(baselineTime + i * 45 * 1000);

        docs.push({
            user_id: users[i]._id,
            source: "mock_seed_train_alert",
            train_number: normalizedTrain,
            station_code: station.station_code || null,
            train_details: toTrainDetails(station, normalizedTrain),
            category: ["general", "service"],
            priority_percentage: 58 + (i % 4) * 8,
            description,
            image_urls: [
                `https://picsum.photos/seed/mock-train-alert-${runId}-${i + 1}/640/360`
            ],
            keywords: ["mock", "train", "alert", "test"],
            departments: ["General"],
            status: "received",
            createdAt,
            updatedAt: createdAt
        });
    }

    const inserted = await Query.insertMany(docs, { ordered: true });
    const lastQuery = inserted[inserted.length - 1];
    const alertResult = await triggerTrainComplaintSpikeAlert({
        query: lastQuery,
        options: {
            ignoreThreshold: Boolean(forceAlert),
            ignoreCooldown: Boolean(forceAlert),
            forceSms: Boolean(sendSms),
            skipSms: !Boolean(sendSms)
        }
    });

    return {
        train_number: normalizedTrain,
        inserted_complaints: inserted.length,
        unique_users_used: users.length,
        threshold,
        force_alert: Boolean(forceAlert),
        sms_requested: Boolean(sendSms),
        alert_result: alertResult,
        query_ids: inserted.map((item) => item._id)
    };
};

export const triggerTrainComplaintSpikeAlert = async ({ query, options = {} }) => {
    try {
        const trainNumber = String(query?.train_number || "").trim();
        if (!trainNumber) {
            return { triggered: false, reason: "missing_train_number" };
        }
        const ignoreThreshold = Boolean(options?.ignoreThreshold);
        const ignoreCooldown = Boolean(options?.ignoreCooldown);
        const forceSms = Boolean(options?.forceSms);
        const skipSms = Boolean(options?.skipSms);

        const threshold = toPositiveInt(process.env.TRAIN_COMPLAINT_ALERT_THRESHOLD, 3);
        const windowMinutes = toPositiveInt(process.env.TRAIN_COMPLAINT_ALERT_WINDOW_MINUTES, 60);
        const cooldownMinutes = toPositiveInt(
            process.env.TRAIN_COMPLAINT_ALERT_COOLDOWN_MINUTES,
            30
        );
        const smsPhone = process.env.TRAIN_COMPLAINT_ALERT_PHONE || DEFAULT_SMS_PHONE;

        const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
        const complaints = await Query.find({
            train_number: trainNumber,
            createdAt: { $gte: windowStart }
        })
            .sort({ createdAt: -1 })
            .select("_id user_id description station_code image_urls createdAt")
            .lean();

        const uniqueUsersCount = new Set(complaints.map((row) => String(row.user_id))).size;
        if (!ignoreThreshold && uniqueUsersCount <= threshold) {
            return {
                triggered: false,
                reason: "below_threshold",
                unique_users_count: uniqueUsersCount
            };
        }

        if (!ignoreCooldown) {
            const cooldownStart = new Date(Date.now() - cooldownMinutes * 60 * 1000);
            const existingAlert = await TrainComplaintAlert.findOne({
                train_number: trainNumber,
                createdAt: { $gte: cooldownStart }
            })
                .sort({ createdAt: -1 })
                .lean();

            if (existingAlert) {
                return {
                    triggered: false,
                    reason: "cooldown_active",
                    alert_id: existingAlert._id
                };
            }
        }

        const stationCode =
            query?.station_code ||
            query?.train_details?.station_code ||
            complaints?.[0]?.station_code ||
            null;
        const nextStations = pickNextStations(trainNumber, stationCode, 3);

        const complaintSummaries = complaints.slice(0, 5).map((row) => ({
            query_id: row._id,
            user_id: row.user_id,
            description: row.description || "",
            image_urls: Array.isArray(row.image_urls) ? row.image_urls : [],
            station_code: row.station_code || null,
            created_at: row.createdAt
        }));

        const imageUrls = toUniqueImageUrls(complaintSummaries, 5);
        const smsMessage = buildSmsMessage({
            trainNumber,
            uniqueUsersCount,
            windowMinutes,
            nextStations,
            complaintSummaries,
            imageUrls
        });
        const smsResult = await sendTextbeltSms({
            phone: smsPhone,
            message: smsMessage,
            forceSend: forceSms,
            skipSend: skipSms
        });

        const alert = await TrainComplaintAlert.create({
            train_number: trainNumber,
            threshold,
            window_minutes: windowMinutes,
            unique_users_count: uniqueUsersCount,
            total_complaints_count: complaints.length,
            station_code: stationCode,
            next_stations: nextStations,
            complaint_ids: complaints.map((row) => row._id),
            complaint_summaries: complaintSummaries,
            image_urls: imageUrls,
            sms_phone: smsPhone,
            sms_provider: "textbelt",
            sms_message: smsMessage,
            sms_status: smsResult.status,
            sms_response: smsResult.response,
            sms_error: smsResult.error
        });

        return {
            triggered: true,
            alert_id: alert._id,
            sms_status: smsResult.status
        };
    } catch (error) {
        console.error("Train complaint alert error:", error);
        return {
            triggered: false,
            reason: "internal_error",
            error: error?.message || "Unknown error"
        };
    }
};
