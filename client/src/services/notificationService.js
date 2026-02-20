import { apiClient, API_BASE_URL } from "../utils/api_client";
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

const BASE_URL = "/notifications";

// Main Notifications
export async function getMainNotifications(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.notificationType && filters.notificationType !== "all")
      params.append("notificationType", filters.notificationType);
    if (filters.isActive && filters.isActive !== "all")
      params.append("isActive", filters.isActive);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`${BASE_URL}/main${queryString}`);

    console.log("Main notifications response:", response.data);
    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch notifications");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error fetching main notifications:", message);
    throw new Error(message);
  }
}

// User Notifications
export async function getUserNotifications(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.isSeen && filters.isSeen !== "all")
      params.append("isSeen", filters.isSeen);
    if (filters.notificationType && filters.notificationType !== "all")
      params.append("notificationType", filters.notificationType);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`${BASE_URL}/user${queryString}`);

    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch notifications");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error fetching user notifications:", message);
    throw new Error(message);
  }
}

// Mark notification as read
export async function markAsRead(notificationId) {
  try {
    const response = await apiClient.put(
      `${BASE_URL}/user/${notificationId}/read`,
    );

    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to mark as read");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error marking notification as read:", message);
    throw new Error(message);
  }
}

// Mark all notifications as read
export async function markAllAsRead() {
  try {
    const response = await apiClient.put(`${BASE_URL}/user/mark-all-read`);

    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to mark all as read");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error marking all notifications as read:", message);
    throw new Error(message);
  }
}

// Get notification statistics
export async function getNotificationStatistics() {
  try {
    const response = await apiClient.get(`${BASE_URL}/statistics`);

    if (response.data.status) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch statistics");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error fetching notification statistics:", message);
    throw new Error(message);
  }
}

// Initialize SSE connection
export function initializeSSE(token) {
  const url = `${
    API_BASE_URL
  }${BASE_URL}/stream?token=${encodeURIComponent(token)}`;

  // Store token in localStorage for SSE
  localStorage.setItem("token", token);

  return {
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}