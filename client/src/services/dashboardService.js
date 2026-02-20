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

// Get notification statistics (already exists in notificationService)
export { getNotificationStatistics } from "./notificationService";
