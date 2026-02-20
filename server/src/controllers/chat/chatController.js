import { asyncHandler, sendResponse, statusType, chatLimiter } from "../../utils/index.js";
import embeddingService from "../../services/embeddingService.js";
import pineconeService from "../../services/pineconeService.js";
import groqService from "../../services/groqService.js";

/**
 * POST /api/chat/ask
 * Body: { query: string }
 *
 * RAG Flow:
 * 1. Embed the user's question (Gemini text-embedding-004)
 * 2. Similarity search in Pinecone (top-5 matching queries)
 * 3. Build context string from matched complaint documents
 * 4. Generate answer with Gemini (RAG prompt via groqService)
 * 5. Return { answer, sources }
 */
export const askAI = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
        return sendResponse(res, false, null, "Query is required", statusType.BAD_REQUEST);
    }

    const trimmedQuery = query.trim();
    console.log(`🔍 [Chat] RAG query from user ${req.user?._id}: "${trimmedQuery.slice(0, 100)}"`);

    // 1. Similarity search in Pinecone
    const matches = await pineconeService.searchSimilar(trimmedQuery, 5);

    console.log(`✅ [Chat] Found ${matches.length} relevant complaints in Pinecone`);

    // 2. Build context string from matched documents
    let context = "";
    const sources = [];

    if (matches.length > 0) {
        context = matches
            .map((match, idx) => {
                const m = match.metadata || {};
                const score = match.score ? `(relevance: ${(match.score * 100).toFixed(1)}%)` : "";

                // Build a human-readable summary for this match
                const lines = [
                    `[Complaint #${idx + 1}] ${score}`,
                    `Description: ${m.description || "N/A"}`,
                    `Category: ${m.category || "N/A"}`,
                    `Status: ${m.status || "N/A"}`,
                    `Priority: ${m.priority_percentage !== undefined ? m.priority_percentage + "%" : "N/A"}`,
                    `Department: ${m.departments || "N/A"}`,
                    `Train: ${m.train_name || m.train_number || "N/A"}`,
                    `Station: ${m.station_name || m.station_code || "N/A"}`,
                    `Created: ${m.created_at || "N/A"}`
                ];

                return lines.join("\n");
            })
            .join("\n\n---\n\n");

        // Build sources array for frontend display
        sources.push(
            ...matches.map((match) => ({
                id: match.id,
                score: match.score,
                description: match.metadata?.description || "",
                status: match.metadata?.status || "",
                priority: match.metadata?.priority_percentage,
                category: match.metadata?.category || "",
                train: match.metadata?.train_name || match.metadata?.train_number || "",
                station: match.metadata?.station_name || match.metadata?.station_code || "",
                department: match.metadata?.departments || "",
                created_at: match.metadata?.created_at || ""
            }))
        );
    }

    // 3. Generate answer
    let answer;

    if (!context) {
        answer =
            "I couldn't find any relevant complaints in the database to answer your question. " +
            "Try asking about specific trains, stations, complaint categories, or priority levels.";
    } else {
        answer = await groqService.ragGenerate(trimmedQuery, context);
    }

    return sendResponse(
        res,
        true,
        { answer, sources },
        "Answer generated successfully",
        statusType.OK
    );
});
