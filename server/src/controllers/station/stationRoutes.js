import express from "express";
import { getStations } from "./stationController.js";

const router = express.Router();

router.get("/", getStations);

export default router;
