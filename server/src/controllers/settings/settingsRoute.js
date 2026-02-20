import express from "express";
import {
    register,
    login,
    checkAuth,
    logout,
    updateSettings,
    getSettings
} from "../../controllers/user/userController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.use(verifyJWT); // Protect all routes below this middleware

// Update user settings
router.put("/update-settings", updateSettings);

// Get user settings
router.get("/settings", getSettings);


export default router;
