import express from "express";
import {
  getAllStocks,
  getStock,
  getStockHistory,
  getHistoricalData,
 getCurrentPrice,
  getMarketSummary,
  haltStock,
} from "../Controllers/stock.controllers.js"
import { protect, requireAdmin } from "../Middleware/auth.middleware.js";


const stockRoutes = express.Router();

/* ── Public routes ───────────────────────────────────────── */
stockRoutes.get("/",                  getAllStocks);       // GET /api/stocks
stockRoutes.get("/summary",           getMarketSummary);  // GET /api/stocks/summary
stockRoutes.get("/:symbol",           getStock);          // GET /api/stocks/TSLA
stockRoutes.get("/:symbol/history",   getStockHistory);   // GET /api/stocks/TSLA/history
stockRoutes.get("/:symbol/historical",getHistoricalData); // GET /api/stocks/TSLA/historical?days=365
stockRoutes.get("/:symbol/price",    getCurrentPrice);      // GET /api/stocks/TSLA/price

/* ── Admin routes ────────────────────────────────────────── */
stockRoutes.put("/:symbol/halt", protect, requireAdmin, haltStock); // PUT /api/stocks/TSLA/halt

export default stockRoutes