import express from "express";
import {
    getAllMainNotifications,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    notificationStream,
    getNotificationStatistics
} from "./notificationController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = express.Router();

// Main notifications
router.get("/stream", notificationStream);

// router.use(verifyJWT);
router.get("/main", getAllMainNotifications);

// User notifications
router.get("/user", getUserNotifications);
router.put("/user/:id/read", markNotificationAsRead);
router.put("/user/mark-all-read", markAllNotificationsAsRead);


// Real-time SSE stream

// Statistics
router.get("/statistics", getNotificationStatistics);

export default router;
