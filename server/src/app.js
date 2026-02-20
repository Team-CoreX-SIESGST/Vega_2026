import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute  from "./controllers/user/userRoutes.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
// import settingsRoute from "./controllers/settings/settingsRoute.js"
import notificationRoute from "./controllers/notifications/notificationRoutes.js"
import stationRoutes from "./controllers/station/stationRoutes.js";
import trainRoutes from "./controllers/train/trainRoutes.js";
import mobileRoutes from "./controllers/mobile/mobileRoutes.js";

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "https://asha-workers-pi.vercel.app"
        ],
        credentials: true
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/auth", userRoute);
// app.use("/api/users", settingsRoute);
app.use("/api/stations", stationRoutes);
app.use(verifyJWT);
app.use("/api/notifications", notificationRoute);
app.use("/api/trains", trainRoutes);
app.use("/api/mobile", mobileRoutes);

// backend route for OAuth callback
app.get("/oauth2callback", (req, res) => {
    // This endpoint should redirect to the frontend callback page with the token
    const token = req.query.access_token;
    if (token) {
        res.redirect(`${process.env.FRONTEND_URL}/oauth-callback#access_token=${token}`);
    } else {
        res.redirect(`${process.env.FRONTEND_URL}/oauth-callback#error=auth_failed`);
    }
});

export { app };
