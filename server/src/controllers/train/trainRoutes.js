import express from "express";
import { getTrains } from "./trainController.js";

const router = express.Router();

router.get("/", getTrains);

export default router;
