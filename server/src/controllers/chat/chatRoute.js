import express from "express";
import { askAI } from "./chatController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { chatLimiter } from "../../utils/index.js";

const router = express.Router();

// All chat routes require authentication
router.use(verifyJWT);

/**
 * POST /api/chat/ask
 * Body: { query: string }
 * Response: { status, data: { answer, sources }, message }
 */
router.post("/ask", chatLimiter, askAI);

export default router;
