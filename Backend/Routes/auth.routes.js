import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} from "../Controllers/auth.controllers.js";
import { protect } from "../Middleware/auth.middleware.js";
import { authLimiter } from "../Middleware/rateLimiter.js";
import User from "../Models/User.js";

const router = express.Router();

/* ── Public routes ───────────────────────────────────────── */
router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/logout",   logout);

/* ── Protected routes ────────────────────────────────────── */
router.get("/me",              protect, getMe);
router.put("/profile",         protect, updateProfile);
router.put("/password",        protect, changePassword);
// PATCH /api/auth/upgrade
router.patch("/upgrade", protect, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: "premium" },
    { new: true }
  ).select("-password");
  res.json({ success: true, user });
});

export default router;