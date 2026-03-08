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
} from "../Controllers/admin.controller.js"
import { protect, requireAdmin } from "../Middleware/auth.middleware.js";
const adminRoutes = express.Router();

// All admin routes require auth + admin role
adminRoutes.use(protect, requireAdmin);

// ── Stats ────────────────────────────────────────────────────
adminRoutes.get("/stats",                    getPlatformStats);   // GET  /api/admin/stats

// ── Users ────────────────────────────────────────────────────
adminRoutes.get("/users",                    getAllUsers);         // GET  /api/admin/users
adminRoutes.get("/users/:id",                getUserDetails);      // GET  /api/admin/users/:id
adminRoutes.put("/users/:id/role",           updateUserRole);      // PUT  /api/admin/users/:id/role
adminRoutes.put("/users/:id/ban",            banUser);             // PUT  /api/admin/users/:id/ban
adminRoutes.put("/users/:id/unban",          unbanUser);           // PUT  /api/admin/users/:id/unban
adminRoutes.put("/users/:id/reset-balance",  resetUserBalance);    // PUT  /api/admin/users/:id/reset-balance

// ── Stocks ───────────────────────────────────────────────────
adminRoutes.get("/stocks",                   getAllStocks);        // GET  /api/admin/stocks
adminRoutes.put("/stocks/:symbol/halt",      haltStock);          // PUT  /api/admin/stocks/TSLA/halt

// ── Trades ───────────────────────────────────────────────────
adminRoutes.get("/trades",                   getRecentTrades);     // GET  /api/admin/trades

// ── System ───────────────────────────────────────────────────
adminRoutes.delete("/cache",                 clearCache);          // DELETE /api/admin/cache

export default adminRoutes;