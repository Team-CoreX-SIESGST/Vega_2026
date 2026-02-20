import { asyncHandler, sendResponse, statusType } from "../../utils/index.js";
import embeddingService from "../../services/embeddingService.js";
import pineconeService from "../../services/pineconeService.js";
import groqService from "../../services/groqService.js";
import Query from "../../models/Query.js"; // Import your Query model

export const askAI = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
        return sendResponse(res, false, null, "Query is required", statusType.BAD_REQUEST);
    }

    const trimmedQuery = query.trim();
    console.log(`\n🔍 === NEW CHAT QUERY ===`);
    console.log(`User: ${req.user?._id}`);
    console.log(`Query: "${trimmedQuery.slice(0, 100)}"`);

    // DEBUG: Check MongoDB count first
    const mongoCount = await Query.countDocuments();
    console.log(`📊 MongoDB total documents: ${mongoCount}`);

    // DEBUG: Check Pinecone stats
    try {
        const stats = await pineconeService.getStats();
        console.log(`📈 Pinecone stats:`, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error(`❌ Pinecone stats error:`, e.message);
    }

    // 1. Generate embedding for query
    console.log(`🔄 Generating embedding for query...`);
    let queryEmbedding;
    try {
        queryEmbedding = await embeddingService.getEmbedding(trimmedQuery);
        console.log(`✅ Embedding generated: ${queryEmbedding.length} dimensions`);
        console.log(`   Sample values: [${queryEmbedding.slice(0, 3).join(", ")}...]`);
    } catch (e) {
        console.error(`❌ Embedding generation failed:`, e.message);
        throw e;
    }

    // 2. Search Pinecone
    console.log(`🔎 Searching Pinecone...`);
    const matches = await pineconeService.searchSimilar(trimmedQuery, 5);

    console.log(`📋 Search results: ${matches.length} matches`);
    if (matches.length > 0) {
        matches.forEach((m, i) => {
            console.log(
                `   [${i}] ID: ${m.id}, Score: ${m.score?.toFixed(4)}, Metadata: ${m.metadata ? "YES" : "NO"}`
            );
        });
    } else {
        console.log(`   ⚠️  NO MATCHES FOUND - This is why you're getting the fallback message!`);
    }

    // 3. Build context
    let context = "";
    const sources = [];

    if (matches.length > 0) {
        context = matches
            .map((match, idx) => {
                const m = match.metadata || {};
                return `[${idx + 1}] ${m.description?.slice(0, 100) || "No description"} (Priority: ${m.priority_percentage}%)`;
            })
            .join("\n");

        sources.push(
            ...matches.map((m) => ({
                id: m.id,
                score: m.score,
                description: m.metadata?.description || ""
            }))
        );
    }

    // 4. Generate or fallback
    let answer;
    if (!context) {
        console.log(`⚠️  No context built - using fallback message`);

        // EMERGENCY FALLBACK: Get recent complaints directly from MongoDB
        console.log(`🆘 Attempting MongoDB fallback...`);
        const recentComplaints = await Query.find().sort({ createdAt: -1 }).limit(3).lean();

        console.log(`   Found ${recentComplaints.length} recent complaints in MongoDB`);

        if (recentComplaints.length > 0) {
            // Build context from MongoDB
            const mongoContext = recentComplaints
                .map(
                    (q, i) =>
                        `[${i + 1}] ${q.description} (Priority: ${q.priority_percentage}%, Status: ${q.status})`
                )
                .join("\n");

            answer = await groqService.ragGenerate(trimmedQuery, mongoContext);
            console.log(`✅ Generated answer from MongoDB fallback`);
        } else {
            answer =
                "I couldn't find any relevant complaints in the database to answer your question. Try asking about specific trains, stations, complaint categories, or priority levels.";
        }
    } else {
        console.log(`🤖 Sending to LLM with context (${context.length} chars)`);
        answer = await groqService.ragGenerate(trimmedQuery, context);
        console.log(`✅ LLM response received (${answer.length} chars)`);
    }

    console.log(`=== END CHAT ===\n`);

    return sendResponse(res, true, { answer, sources }, "Answer generated", statusType.OK);
});
