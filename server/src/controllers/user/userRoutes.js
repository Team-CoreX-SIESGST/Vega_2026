import express from "express";
import {
    register,
    login,
    checkAuth,
    logout,
} from "./userController.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = express.Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Check authentication status
router.get("/check", checkAuth);

router.use(verifyJWT); // Protect all routes below this middleware

// Logout route
router.post("/logout", logout);

export default router;
