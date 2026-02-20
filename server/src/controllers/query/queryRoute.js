import express from "express";
import {
    createQuery,
    getAllQueries,
    getQueryById,
    updateQuery,
    updateQueryStatus,
    deleteQuery,
    getDashboardStatistics
} from "./queryControllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { checkRole } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(verifyJWT); // All routes require authentication

// Dashboard statistics
router.get("/dashboard/statistics", getDashboardStatistics);

// Create query with image upload (max 5 images)
router.post(
    "/", 
    upload.array("images", 5), 
    createQuery
);

// Get all queries with filters
router.get("/", getAllQueries);

// Get single query
router.get("/:id", getQueryById);

// Update query (owner or admin)
router.put("/:id", updateQuery);

// Update status (Admin/Super Admin only)
router.patch(
    "/:id/status", 
    checkRole(["admin", "super_admin"]), 
    updateQueryStatus
);

// Delete query (owner or admin)
router.delete("/:id", deleteQuery);

export default router;