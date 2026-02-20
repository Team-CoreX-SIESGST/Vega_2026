import { Pinecone } from "@pinecone-database/pinecone";
import embeddingService from "./embeddingService.js";

const NAMESPACE = "queries-ns";
const BATCH_SIZE = 100; // Pinecone upsert batch limit recommendation

class PineconeService {
    constructor() {
        this._client = null;
        this._index = null;
    }

    _getIndex() {
        if (!this._index) {
            if (!process.env.PINECONE_API_KEY) {
                throw new Error("PINECONE_API_KEY is not set in environment");
            }
            if (!process.env.PINECONE_INDEX_NAME) {
                throw new Error("PINECONE_INDEX_NAME is not set in environment");
            }
            this._client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
            this._index = this._client.Index(process.env.PINECONE_INDEX_NAME);
        }
        return this._index;
    }

    /**
     * Build Pinecone metadata from a Query mongoose document.
     * Pinecone metadata values must be strings, numbers, or booleans.
     */
    _buildMetadata(queryDoc) {
        return {
            mongo_id: queryDoc._id?.toString() || "",
            description: (queryDoc.description || "").slice(0, 500), // Pinecone metadata string limit
            category: (queryDoc.category || []).join(", "),
            keywords: (queryDoc.keywords || []).join(", "),
            departments: (queryDoc.departments || []).join(", "),
            status: queryDoc.status || "received",
            priority_percentage: queryDoc.priority_percentage || 0,
            train_number: queryDoc.train_number || "",
            train_name: queryDoc.train_details?.train_name || "",
            station_code: queryDoc.train_details?.station_code || queryDoc.station_code || "",
            station_name: queryDoc.train_details?.station_name || "",
            created_at: queryDoc.createdAt ? queryDoc.createdAt.toISOString() : new Date().toISOString()
        };
    }

    /**
     * Upsert a single Query document into Pinecone.
     * @param {object} queryDoc - Mongoose Query document
     */
    async upsertQuery(queryDoc) {
        try {
            const index = this._getIndex();
            const text = embeddingService.buildQueryText(queryDoc);
            const embedding = await embeddingService.getEmbedding(text);

            await index.namespace(NAMESPACE).upsert([
                {
                    id: queryDoc._id.toString(),
                    values: embedding,
                    metadata: this._buildMetadata(queryDoc)
                }
            ]);

            console.log(`✅ Pinecone: upserted query ${queryDoc._id}`);
        } catch (err) {
            // Don't throw — Pinecone sync failure should not break query creation
            console.error(`⚠️  Pinecone upsert failed for ${queryDoc._id}:`, err.message);
        }
    }

    /**
     * Batch upsert an array of Query documents (used during seeding).
     * @param {Array} queryDocs - Array of Mongoose Query documents
     */
    async upsertMany(queryDocs) {
        let total = 0;
        
        for (let i = 0; i < queryDocs.length; i += BATCH_SIZE) {
            const batch = queryDocs.slice(i, i + BATCH_SIZE);
            const vectors = [];

            for (const doc of batch) {
                try {
                    const text = embeddingService.buildQueryText(doc);
                    const embedding = await embeddingService.getEmbedding(text);
                    vectors.push({
                        id: doc._id.toString(),
                        values: embedding,
                        metadata: this._buildMetadata(doc)
                    });
                } catch (err) {
                    console.warn(`  Skipping doc ${doc._id}: ${err.message}`);
                }
            }

            if (vectors.length > 0) {
                const index = this._getIndex();
                await index.namespace(NAMESPACE).upsert(vectors);
                total += vectors.length;
                console.log(`  Batch ${Math.ceil(i / BATCH_SIZE) + 1}: upserted ${vectors.length} vectors (total: ${total})`);
            }
        }

        return total;
    }

    /**
     * Search for semantically similar queries.
     * @param {string} queryText - User's natural language question
     * @param {number} topK - Number of results to return
     * @returns {Promise<Array>} - Array of matches with metadata
     */
    async searchSimilar(queryText, topK = 5) {
        const index = this._getIndex();
        const embedding = await embeddingService.getEmbedding(queryText);

        const response = await index.namespace(NAMESPACE).query({
            vector: embedding,
            topK,
            includeMetadata: true
        });

        return response.matches || [];
    }

    /**
     * Delete a query from Pinecone by MongoDB ObjectId string.
     * @param {string} id
     */
    async deleteQuery(id) {
        try {
            const index = this._getIndex();
            await index.namespace(NAMESPACE).deleteOne(id);
        } catch (err) {
            console.error(`⚠️  Pinecone delete failed for ${id}:`, err.message);
        }
    }
}

const pineconeService = new PineconeService();
export default pineconeService;
