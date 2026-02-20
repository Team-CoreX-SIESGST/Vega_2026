import express from "express";
import { getTrain, createComplaint, getComplaints } from "./mobileController.js";

const router = express.Router();

router.get("/train/:trainNumber", getTrain);
router.post("/complaint", createComplaint);
router.get("/complaints", getComplaints);

export default router;
