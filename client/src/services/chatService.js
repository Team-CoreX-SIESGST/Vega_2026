import { apiClient } from "@/utils/api_client";

/**
 * Chat service for the RailMind AI chat interface.
 * Communicates with the backend POST /api/chat/ask endpoint.
 */
class ChatService {
    /**
     * Send a user message to the RailMind AI backend.
     * @param {string} query - User's natural language question
     * @returns {Promise<{ answer: string, sources: Array }>}
     */
    async sendMessage(query) {
        const { data } = await apiClient.post("/chat/ask", { query });

        if (!data.status) {
            throw new Error(data.message || "Failed to get an answer from RailMind AI");
        }

        return {
            answer: data.data?.answer || "No answer returned.",
            sources: data.data?.sources || []
        };
    }
}

const chatService = new ChatService();
export default chatService;
