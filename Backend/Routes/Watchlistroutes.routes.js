import express from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
  checkWatchlist,
} from "../Controllers/Watchlistcontroller.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/",              getWatchlist);         // GET    /api/watchlist
router.delete("/",           clearWatchlist);       // DELETE /api/watchlist
router.get("/check/:symbol", checkWatchlist);       // GET    /api/watchlist/check/TSLA
router.post("/:symbol",      addToWatchlist);       // POST   /api/watchlist/TSLA
router.delete("/:symbol",    removeFromWatchlist);  // DELETE /api/watchlist/TSLA

export default router;