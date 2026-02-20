import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini text-embedding-004 produces 768-dimensional vectors
const EMBEDDING_MODEL = "text-embedding-004";

class EmbeddingService {
    /**
     * Get an embedding vector for a given text.
     * @param {string} text - The text to embed
     * @returns {Promise<number[]>} - 768-dimensional vector
     */
    async getEmbedding(text) {
        if (!text || typeof text !== "string") {
            throw new Error("EmbeddingService: text must be a non-empty string");
        }

        const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

        const result = await model.embedContent({
            content: {
                role: "user",
                parts: [{ text: text.trim().slice(0, 2048) }] // Gemini has input limit
            }
        });

        const embedding = result.embedding?.values;

        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("EmbeddingService: Received empty embedding from Gemini");
        }

        return embedding;
    }

    /**
     * Build a rich text representation of a MongoDB Query document for embedding.
     * @param {object} queryDoc - Mongoose Query document
     * @returns {string}
     */
    buildQueryText(queryDoc) {
        const parts = [];

        if (queryDoc.description) parts.push(`Complaint: ${queryDoc.description}`);
        if (queryDoc.category?.length) parts.push(`Category: ${queryDoc.category.join(", ")}`);
        if (queryDoc.keywords?.length) parts.push(`Keywords: ${queryDoc.keywords.join(", ")}`);
        if (queryDoc.departments?.length) parts.push(`Department: ${queryDoc.departments.join(", ")}`);
        if (queryDoc.status) parts.push(`Status: ${queryDoc.status}`);
        if (queryDoc.priority_percentage !== undefined) {
            parts.push(`Priority: ${queryDoc.priority_percentage}%`);
        }
        if (queryDoc.train_details) {
            const td = queryDoc.train_details;
            if (td.train_name) parts.push(`Train: ${td.train_name}`);
            if (td.station_name) parts.push(`Station: ${td.station_name} (${td.station_code || ""})`);
        }
        if (queryDoc.train_number) parts.push(`Train Number: ${queryDoc.train_number}`);

        return parts.join(". ");
    }
}

const embeddingService = new EmbeddingService();
export default embeddingService;
