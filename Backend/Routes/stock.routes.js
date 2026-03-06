import express from "express";
import {
  getAllStocks,
  getStock,
  getStockHistory,
  getHistoricalData,
  getLivePrice,
  getMarketSummary,
  haltStock,
} from "../Controllers/stockController.js";
import { protect }       from "../Middleware/authMiddleware.js";
import { requireAdmin }  from "../Middleware/authMiddleware.js";

const router = express.Router();

/* ── Public routes ───────────────────────────────────────── */
router.get("/",                  getAllStocks);       // GET /api/stocks
router.get("/summary",           getMarketSummary);  // GET /api/stocks/summary
router.get("/:symbol",           getStock);          // GET /api/stocks/TSLA
router.get("/:symbol/history",   getStockHistory);   // GET /api/stocks/TSLA/history
router.get("/:symbol/historical",getHistoricalData); // GET /api/stocks/TSLA/historical?days=365
router.get("/:symbol/price",     getLivePrice);      // GET /api/stocks/TSLA/price

/* ── Admin routes ────────────────────────────────────────── */
router.put("/:symbol/halt", protect, requireAdmin, haltStock); // PUT /api/stocks/TSLA/halt

export default router;