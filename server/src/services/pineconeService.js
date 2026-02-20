import { Pinecone } from "@pinecone-database/pinecone";
import embeddingService from "./embeddingService.js";

const NAMESPACE = "queries-ns";
const BATCH_SIZE = 100;

class PineconeService {
    constructor() {
        this._client = null;
        this._index = null;
        this._indexName = process.env.PINECONE_INDEX_NAME;
    }

    _getClient() {
        if (!this._client) {
            if (!process.env.PINECONE_API_KEY) {
                throw new Error("PINECONE_API_KEY not set");
            }
            this._client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        }
        return this._client;
    }

    _getIndex() {
        if (!this._index) {
            const client = this._getClient();
            if (!this._indexName) {
                throw new Error("PINECONE_INDEX_NAME not set");
            }
            this._index = client.Index(this._indexName);
        }
        return this._index;
    }

    async getStats() {
        const index = this._getIndex();
        const stats = await index.describeIndexStats();
        const nsStats = stats.namespaces?.[NAMESPACE];
        return {
            totalVectors: stats.totalRecordCount,
            dimension: stats.dimension,
            namespace: NAMESPACE,
            namespaceCount: nsStats?.recordCount || 0
        };
    }

    _buildMetadata(queryDoc) {
        return {
            mongo_id: queryDoc._id?.toString() || "",
            description: (queryDoc.description || "").slice(0, 500),
            category: (queryDoc.category || []).join(", "),
            keywords: (queryDoc.keywords || []).join(", "),
            departments: (queryDoc.departments || []).join(", "),
            status: queryDoc.status || "received",
            priority_percentage: queryDoc.priority_percentage ?? 0,
            train_number: queryDoc.train_number || "",
            train_name: queryDoc.train_details?.train_name || "",
            station_code: queryDoc.train_details?.station_code || queryDoc.station_code || "",
            station_name: queryDoc.train_details?.station_name || "",
            created_at: queryDoc.createdAt
                ? queryDoc.createdAt.toISOString()
                : new Date().toISOString()
        };
    }

    /**
     * Upsert a single query - NOW WITH STRICT ERROR HANDLING
     */
    async upsertQuery(queryDoc) {
        const index = this._getIndex();
        const text = embeddingService.buildQueryText(queryDoc);

        console.log(`📝 Upserting: ${text.slice(0, 60)}...`);

        const embedding = await embeddingService.getEmbedding(text);

        await index.namespace(NAMESPACE).upsert([
            {
                id: queryDoc._id.toString(),
                values: embedding,
                metadata: this._buildMetadata(queryDoc)
            }
        ]);

        console.log(`✅ Upserted: ${queryDoc._id} to ${NAMESPACE}`);
        return true;
    }

    /**
     * Batch upsert with proper error propagation
     */
    async upsertMany(queryDocs) {
        const index = this._getIndex();
        let total = 0;
        let failed = 0;

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
                    console.error(`❌ Failed to embed ${doc._id}:`, err.message);
                    failed++;
                }
            }

            if (vectors.length > 0) {
                await index.namespace(NAMESPACE).upsert(vectors);
                total += vectors.length;
                console.log(
                    `📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: +${vectors.length} vectors (total: ${total})`
                );
            }
        }

        if (failed > 0) {
            console.warn(`⚠️ ${failed} documents failed to upsert`);
        }

        return { upserted: total, failed };
    }

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

    async deleteQuery(id) {
        const index = this._getIndex();
        await index.namespace(NAMESPACE).deleteOne(id);
    }
}

const pineconeService = new PineconeService();
export default pineconeService;
