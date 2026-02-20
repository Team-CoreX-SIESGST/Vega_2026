import { apiClient } from "@/utils/api_client";
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

const BASE_URL = "/queries";

// Get dashboard statistics
export async function getDashboardStatistics() {
  try {
    const response = await apiClient.get(`${BASE_URL}/dashboard/statistics`);

    if (response.data.status) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch dashboard statistics");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error fetching dashboard statistics:", message);
    throw new Error(message);
  }
}

// Get train complaint spike alerts
export async function getTrainComplaintAlerts({
  trainNumber = "",
  page = 1,
  limit = 10,
} = {}) {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (String(trainNumber).trim()) {
      params.set("train_number", String(trainNumber).trim());
    }

    const response = await apiClient.get(`${BASE_URL}/train-alerts?${params.toString()}`);

    if (response.data?.status) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to fetch train complaint alerts");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error fetching train complaint alerts:", message);
    throw new Error(message);
  }
}

// Seed mock complaint data to trigger train alerts
export async function seedTrainAlertMockData({
  trainNumber = "107",
  complaintsCount = 6,
  sendSms = false,
  forceAlert = false,
} = {}) {
  try {
    const payload = {
      train_number: String(trainNumber).trim() || "107",
      complaints_count: Number(complaintsCount) || 6,
      send_sms: !!sendSms,
      force_alert: !!forceAlert,
    };

    const response = await apiClient.post(`${BASE_URL}/train-alerts/mock-seed`, payload);

    if (response.data?.status) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to seed train alert mock data");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error seeding train alert mock data:", message);
    throw new Error(message);
  }
}

// Get notification statistics (already exists in notificationService)
export { getNotificationStatistics } from "./notificationService";
