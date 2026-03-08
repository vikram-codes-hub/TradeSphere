import express from "express";
import {
  getPortfolio,
  getPortfolioSummary,
  getHolding,
  getPnL,
  getAllocation,
} from "../Controllers/portfolio.controller.js"
import { protect } from "../Middleware/auth.middleware.js";

const portfolioRoutes = express.Router();
portfolioRoutes.use(protect);

portfolioRoutes.get("/",            getPortfolio);        // GET /api/portfolio
portfolioRoutes.get("/summary",    getPortfolioSummary); // GET /api/portfolio/summary
portfolioRoutes.get("/pnl",         getPnL);              // GET /api/portfolio/pnl
portfolioRoutes.get("/allocation",  getAllocation);        // GET /api/portfolio/allocation
portfolioRoutes.get("/:symbol",     getHolding);          // GET /api/portfolio/TSLA

export default portfolioRoutes;