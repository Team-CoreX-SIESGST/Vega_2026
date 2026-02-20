import express from "express";
import { getTrain, getTrainSchedule, getTrainStations, createComplaint, getComplaints, createComplaintWithGemini } from "./mobileController.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/train/:trainNumber", getTrain);
router.get("/train/:trainNumber/schedule", getTrainSchedule);
router.get("/train/:trainNumber/stations", getTrainStations);
router.post("/complaint", createComplaint);
router.post("/complaint-with-gemini", upload.array("images", 5), createComplaintWithGemini);
router.get("/complaints", getComplaints);

export default router;
