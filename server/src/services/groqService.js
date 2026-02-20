import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We use Gemini Flash for cheap, fast RAG answers
const RAG_MODEL = "gemini-3-flash-preview";

class GroqService {
    /**
     * Generate a RAG-based answer using Gemini, given a user question and context.
     * @param {string} userQuestion - The user's natural language question
     * @param {string} context - Relevant documents fetched from Pinecone
     * @returns {Promise<string>} - Generated answer
     */
    async ragGenerate(userQuestion, context) {
        const model = genAI.getGenerativeModel({ model: RAG_MODEL });

        const prompt = `You are RailMind, an intelligent assistant for the Indian Railways complaint management system. 
You help railway officials and administrators understand complaints, trends, and status updates.

Use ONLY the context below to answer the question. If the context doesn't contain enough information, say so clearly.
Do NOT make up data. Keep your answers crisp and actionable.

--- CONTEXT (Retrieved Complaints from Database) ---
${context}
--- END CONTEXT ---

User Question: "${userQuestion}"

Answer in a clear, professional tone. If referencing specific complaints, mention their priority and status.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    /**
     * Generate a concise summary for a list of query texts.
     * @param {string[]} descriptions - Array of complaint descriptions
     * @returns {Promise<string>}
     */
    async summarizeComplaints(descriptions) {
        const model = genAI.getGenerativeModel({ model: RAG_MODEL });

        const prompt = `Summarize the following railway complaints into a brief executive summary (3-5 sentences). 
Highlight common themes, urgency levels, and recommended actions.

Complaints:
${descriptions.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Summary:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}

const groqService = new GroqService();
export default groqService;
