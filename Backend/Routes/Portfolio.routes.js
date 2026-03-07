import express from "express";
import {
  getPortfolio,
  getPortfolioSummary,
  getHolding,
  getPnL,
  getAllocation,
} from "../Controllers/portfolioController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/",            getPortfolio);        // GET /api/portfolio
router.get("/summary",     getPortfolioSummary); // GET /api/portfolio/summary
router.get("/pnl",         getPnL);              // GET /api/portfolio/pnl
router.get("/allocation",  getAllocation);        // GET /api/portfolio/allocation
router.get("/:symbol",     getHolding);          // GET /api/portfolio/TSLA

export default router;