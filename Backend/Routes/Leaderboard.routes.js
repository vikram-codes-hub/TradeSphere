import express from "express";
import { getLeaderboard, getMyRank } from "../Controllers/leaderboardController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/",   getLeaderboard);          // GET /api/leaderboard
router.get("/me", protect, getMyRank);      // GET /api/leaderboard/me

export default router;