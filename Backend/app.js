import express      from "express";
import cors         from "cors";
import morgan       from "morgan";
import cookieParser from "cookie-parser";
import helmet       from "helmet";

import { notFound, errorHandler } from "./Middleware/errorMiddleware.js";
import { apiLimiter }             from "./Middleware/rateLimiter.js";

export const app = express();

/* ── Security ────────────────────────────────────────────── */
app.use(helmet());

/* ── CORS ────────────────────────────────────────────────── */
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

/* ── Body parsers ────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── Logging ─────────────────────────────────────────────── */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ── Global rate limiter ─────────────────────────────────── */
app.use("/api", apiLimiter);

/* ── Health check ────────────────────────────────────────── */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success:   true,
    message:   "TradeSphere API is running 🚀",
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || "development",
  });
});

/* ── Routes (add here as you build them) ─────────────────── */
import authRoutes        from "./Routes/auth.routes.js";
import stockRoutes from "./Routes/stock.routes.js";
import router from "./Routes/trade.routes.js"
import portfolioRoutes from "./Routes/Portfolio.routes.js";
import predictionRoutes from "./Routes/Prediction.routes.js";
import leaderboardRoutes from "./Routes/Leaderboard.routes.js";
import watchlistRoutes from "./Routes/Watchlistroutes.routes.js";
import adminRoutes from "./Routes/admin.routes.js";

app.use("/api/auth",        authRoutes);
app.use("/api/stocks",      stockRoutes);
app.use("/api/trades",      router);
app.use("/api/portfolio",   portfolioRoutes);
app.use("/api/predict",     predictionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/watchlist",   watchlistRoutes);
app.use("/api/admin",       adminRoutes);

/* ── Error handlers — MUST be last ──────────────────────── */
app.use(notFound);      // catches unknown routes → 404
app.use(errorHandler);  // catches all next(err) → formatted JSON