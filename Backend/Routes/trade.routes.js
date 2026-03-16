import express from "express";
import {
  buyStock,
  sellStock,
  getTradeHistory,
  getTrade,
  getTradeStats,
  getMarketStatus,
} from "../Controllers/trade.controllers.js";
import { protect } from "../Middleware/auth.middleware.js";
import { tradeLimiter } from "../Middleware/rateLimiter.js";


const router = express.Router();

router.use(protect); // all trade routes require auth

router.post("/buy",    tradeLimiter, buyStock);      // POST /api/trades/buy
router.post("/sell",   tradeLimiter, sellStock);     // POST /api/trades/sell
router.get("/stats",   getTradeStats);               // GET  /api/trades/stats
router.get("/history", getTradeHistory);             // GET  /api/trades/history
router.get("/:id",     getTrade);                    // GET  /api/trades/:id
router.get("/market-status", protect, getMarketStatus);

export default router;