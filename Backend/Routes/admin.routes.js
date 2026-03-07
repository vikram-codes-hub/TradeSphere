import express from "express";
import {
  getPlatformStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  banUser,
  unbanUser,
  resetUserBalance,
  getAllStocks,
  haltStock,
  getRecentTrades,
  clearCache,
} from "../Controllers/adminController.js";
import { protect }      from "../Middleware/authMiddleware.js";
import { requireAdmin } from "../Middleware/roleMiddleware.js";

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// ── Stats ────────────────────────────────────────────────────
router.get("/stats",                    getPlatformStats);   // GET  /api/admin/stats

// ── Users ────────────────────────────────────────────────────
router.get("/users",                    getAllUsers);         // GET  /api/admin/users
router.get("/users/:id",                getUserDetails);      // GET  /api/admin/users/:id
router.put("/users/:id/role",           updateUserRole);      // PUT  /api/admin/users/:id/role
router.put("/users/:id/ban",            banUser);             // PUT  /api/admin/users/:id/ban
router.put("/users/:id/unban",          unbanUser);           // PUT  /api/admin/users/:id/unban
router.put("/users/:id/reset-balance",  resetUserBalance);    // PUT  /api/admin/users/:id/reset-balance

// ── Stocks ───────────────────────────────────────────────────
router.get("/stocks",                   getAllStocks);        // GET  /api/admin/stocks
router.put("/stocks/:symbol/halt",      haltStock);          // PUT  /api/admin/stocks/TSLA/halt

// ── Trades ───────────────────────────────────────────────────
router.get("/trades",                   getRecentTrades);     // GET  /api/admin/trades

// ── System ───────────────────────────────────────────────────
router.delete("/cache",                 clearCache);          // DELETE /api/admin/cache

export default router;