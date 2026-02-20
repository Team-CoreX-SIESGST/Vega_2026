import { pipeline } from "@xenova/transformers";

class EmbeddingService {
    constructor() {
        this.pipe = null;
        this.modelName = "Xenova/all-mpnet-base-v2"; // 384-dim, high quality
    }

    async getPipeline() {
        if (!this.pipe) {
            console.log("📥 Loading embedding pipeline...");
            try {
                // 'feature-extraction' task with mean pooling for sentence embeddings
                this.pipe = await pipeline("feature-extraction", this.modelName, {
                    quantized: false // Set true if you want faster loading (slightly less accurate)
                });
                console.log("✅ Embedding pipeline loaded successfully");
            } catch (error) {
                console.error("❌ Failed to load embedding pipeline:", error.message);
                throw new Error(`EmbeddingService: Failed to load model - ${error.message}`);
            }
        }
        return this.pipe;
    }

    /**
     * Generate embedding vector for text
     * @param {string} text - Text to embed
     * @returns {Promise<number[]>} - 384-dimensional normalized vector
     */
    async getEmbedding(text) {
        if (!text || typeof text !== "string") {
            throw new Error("EmbeddingService: text must be a non-empty string");
        }

        // Clean and truncate text (model has 512 token limit, ~2048 chars safe)
        const cleanText = text.trim().slice(0, 2048);

        if (!cleanText) {
            throw new Error("EmbeddingService: text is empty after cleaning");
        }

        try {
            const pipe = await this.getPipeline();

            // Generate embedding with mean pooling and normalization
            const output = await pipe(cleanText, {
                pooling: "mean",
                normalize: true
            });

            // Convert Float32Array to regular Array
            const embedding = Array.from(output.data);

            if (!embedding || embedding.length === 0) {
                throw new Error("EmbeddingService: Received empty embedding");
            }

            return embedding;
        } catch (error) {
            console.error("EmbeddingService Error:", error.message);
            throw error;
        }
    }

    /**
     * Generate embeddings for multiple texts (batch processing)
     * @param {string[]} texts - Array of texts to embed
     * @returns {Promise<number[][]>} - Array of embedding vectors
     */
    async getEmbeddingsBatch(texts) {
        if (!Array.isArray(texts) || texts.length === 0) {
            throw new Error("EmbeddingService: texts must be a non-empty array");
        }

        const validTexts = texts
            .filter((t) => typeof t === "string" && t.trim().length > 0)
            .map((t) => t.trim().slice(0, 2048));

        if (validTexts.length === 0) {
            throw new Error("EmbeddingService: No valid texts to embed");
        }

        try {
            const pipe = await this.getPipeline();

            // Process in batches to avoid memory issues
            const batchSize = 10;
            const embeddings = [];

            for (let i = 0; i < validTexts.length; i += batchSize) {
                const batch = validTexts.slice(i, i + batchSize);
                const outputs = await Promise.all(
                    batch.map((text) => pipe(text, { pooling: "mean", normalize: true }))
                );
                embeddings.push(...outputs.map((out) => Array.from(out.data)));
            }

            return embeddings;
        } catch (error) {
            console.error("EmbeddingService Batch Error:", error.message);
            throw error;
        }
    }

    /**
     * Build a rich text string from a MongoDB Query document for embedding.
     * @param {object} queryDoc - Mongoose Query document (or plain object from .lean())
     * @returns {string}
     */
    buildQueryText(queryDoc) {
        if (!queryDoc || typeof queryDoc !== "object") {
            return "";
        }

        const parts = [];

        if (queryDoc.description) parts.push(`Complaint: ${queryDoc.description}`);
        if (queryDoc.category?.length) parts.push(`Category: ${queryDoc.category.join(", ")}`);
        if (queryDoc.keywords?.length) parts.push(`Keywords: ${queryDoc.keywords.join(", ")}`);
        if (queryDoc.departments?.length)
            parts.push(`Department: ${queryDoc.departments.join(", ")}`);
        if (queryDoc.status) parts.push(`Status: ${queryDoc.status}`);
        if (queryDoc.priority_percentage !== undefined) {
            parts.push(`Priority: ${queryDoc.priority_percentage}%`);
        }
        if (queryDoc.train_details) {
            const td = queryDoc.train_details;
            if (td.train_name) parts.push(`Train: ${td.train_name}`);
            if (td.station_name)
                parts.push(`Station: ${td.station_name} (${td.station_code || ""})`);
        }
        if (queryDoc.train_number) parts.push(`Train Number: ${queryDoc.train_number}`);

        return parts.join(". ");
    }

    /**
     * Get embedding dimension size
     * @returns {number} - 384 for all-mpnet-base-v2
     */
    getDimension() {
        return 384;
    }

    /**
     * Clear pipeline from memory (useful for hot-reloading in dev)
     */
    dispose() {
        this.pipe = null;
        console.log("🗑️ Embedding pipeline disposed");
    }
}

// Export singleton instance
const embeddingService = new EmbeddingService();
export default embeddingService;
