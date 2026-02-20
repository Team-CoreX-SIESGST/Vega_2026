import { apiClient } from "../utils/api_client";
import { getApiErrorMessage } from "@/utils/apiErrorhelper";

const BASE_URL = "/stations";

// Get all stations
export async function getStations() {
  try {
    const response = await apiClient.get(BASE_URL);

    console.log("Stations response:", response.data);
    if (response.data.status) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch stations");
  } catch (error) {
    const message = getApiErrorMessage(error);
    console.error("Error fetching stations:", message);
    throw new Error(message);
  }
}

