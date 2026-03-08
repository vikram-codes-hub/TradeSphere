import express from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
  checkWatchlist,
} from "../Controllers/Watchlistcontroller.js"
import { protect } from "../Middleware/auth.middleware.js";

const watchlistRoutes = express.Router();
watchlistRoutes.use(protect);

watchlistRoutes.get("/",              getWatchlist);         // GET    /api/watchlist
watchlistRoutes.delete("/",           clearWatchlist);       // DELETE /api/watchlist
watchlistRoutes.get("/check/:symbol", checkWatchlist);       // GET    /api/watchlist/check/TSLA
watchlistRoutes.post("/:symbol",      addToWatchlist);       // POST   /api/watchlist/TSLA
watchlistRoutes.delete("/:symbol",    removeFromWatchlist);  // DELETE /api/watchlist/TSLA

export default watchlistRoutes;