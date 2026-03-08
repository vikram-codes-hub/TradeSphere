import express from "express";
import {
  getLeaderboard,
  getMyRank,
} from "../Controllers/leaderboard.controller.js";
import { protect } from "../Middleware/auth.middleware.js";

const leaderboardRoutes = express.Router();

leaderboardRoutes.get("/",   getLeaderboard);          // GET /api/leaderboard
leaderboardRoutes.get("/me", protect, getMyRank);      // GET /api/leaderboard/me

export default leaderboardRoutes;