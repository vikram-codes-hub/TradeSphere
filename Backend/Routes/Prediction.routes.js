import express from "express";
import {
  requestPrediction,
  getMyPredictions,
  getPrediction,
  getLatestPrediction,
  getTrendingPredictions,
  getPredictionUsage,
} from "../Controllers/prediction.controller.js";
import { protect } from "../Middleware/auth.middleware.js";
import { predictionLimiter } from "../Middleware/rateLimiter.js";

const predictionRoutes = express.Router();

// Public
predictionRoutes.get("/trending", getTrendingPredictions);  // GET /api/predict/trending

// Protected
predictionRoutes.use(protect);
predictionRoutes.post("/",              predictionLimiter, requestPrediction);  // POST /api/predict
predictionRoutes.get("/history",        getMyPredictions);                      // GET  /api/predict/history
predictionRoutes.get("/usage",          getPredictionUsage);                    // GET  /api/predict/usage
predictionRoutes.get("/latest/:symbol", getLatestPrediction);                   // GET  /api/predict/latest/TSLA
predictionRoutes.get("/:id",            getPrediction);                         // GET  /api/predict/:id

export default predictionRoutes;