import express from "express";
import {
  requestPrediction,
  getMyPredictions,
  getPrediction,
  getLatestPrediction,
  getTrendingPredictions,
  getPredictionUsage,
} from "../Controllers/predictionController.js";
import { protect }           from "../Middleware/authMiddleware.js";
import { predictionLimiter } from "../Middleware/rateLimiter.js";

const router = express.Router();

// Public
router.get("/trending", getTrendingPredictions);  // GET /api/predict/trending

// Protected
router.use(protect);
router.post("/",              predictionLimiter, requestPrediction);  // POST /api/predict
router.get("/history",        getMyPredictions);                      // GET  /api/predict/history
router.get("/usage",          getPredictionUsage);                    // GET  /api/predict/usage
router.get("/latest/:symbol", getLatestPrediction);                   // GET  /api/predict/latest/TSLA
router.get("/:id",            getPrediction);                         // GET  /api/predict/:id

export default router;