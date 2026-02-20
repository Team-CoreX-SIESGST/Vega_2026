/**
 * seedPinecone.js
 *
 * One-time seeding script: reads all Query documents from MongoDB
 * and bulk-upserts them into Pinecone with Gemini embeddings.
 *
 * Usage:
 *   node --env-file=.env src/scripts/seedPinecone.js
 *
 * Or with dotenv/config (existing npm script pattern):
 *   node -r dotenv/config src/scripts/seedPinecone.js
 */

import mongoose from "mongoose";
import Query from "../models/Query.js";
import pineconeService from "../services/pineconeService.js";

const MONGO_URI = process.env.MONGODB_URL || process.env.DATABASE_URL;
const BATCH_PAUSE_MS = 500; // Small delay between batches to avoid Gemini rate limits

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seed() {
    console.log("🚀 RailMind Pinecone Seeder");
    console.log("================================");

    // 1. Connect to MongoDB
    if (!MONGO_URI) {
        console.error("❌ MONGO_URI / DATABASE_URL is not set in environment");
        process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // 2. Count total queries
    const total = await Query.countDocuments();
    console.log(`📊 Found ${total} queries in MongoDB`);

    if (total === 0) {
        console.log("⚠️  No queries found. Create some queries first, then re-run this script.");
        await mongoose.disconnect();
        process.exit(0);
    }

    // 3. Fetch in pages to avoid memory issues on large collections
    const PAGE_SIZE = 50;
    let processed = 0;
    let page = 0;

    console.log(`\n📤 Starting upsert to Pinecone (index: ${process.env.PINECONE_INDEX_NAME})`);
    console.log(`   Embedding model: text-embedding-004 (768-dim)`);
    console.log(`   Namespace: queries-ns\n`);

    while (processed < total) {
        const docs = await Query.find()
            .sort({ createdAt: -1 })
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(); // Use lean() for performance during seeding

        if (docs.length === 0) break;

        console.log(`📦 Processing page ${page + 1} (docs ${processed + 1} – ${processed + docs.length} of ${total})`);

        const seeded = await pineconeService.upsertMany(docs);
        processed += docs.length;
        page++;

        console.log(`   ✅ Page complete. Total seeded so far: ${processed}/${total}\n`);

        // Pause between pages to avoid Gemini embedding rate limits
        if (processed < total) {
            await sleep(BATCH_PAUSE_MS);
        }
    }

    console.log("================================");
    console.log(`🎉 Seeding complete! ${processed} queries indexed in Pinecone.`);
    console.log("\nYou can now use the /api/chat/ask endpoint for RAG queries.");

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected. Done.");
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err.message);
    mongoose.disconnect();
    process.exit(1);
});
