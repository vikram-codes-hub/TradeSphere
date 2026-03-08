import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/* ============================================================
   RATE LIMITERS
   Fixed for express-rate-limit v7+ IPv6 compatibility
   ============================================================ */

/* ── General API limiter ───────────────────────────────────── */
export const apiLimiter = rateLimit({
  windowMs:       0,           // 15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

/* ── Auth limiter ──────────────────────────────────────────── */
export const authLimiter = rateLimit({
  windowMs:              0,              // 15 * 60 * 1000,
  max:                    10,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

/* ── Trade limiter ─────────────────────────────────────────── */
export const tradeLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => req.user?._id?.toString() || ipKeyGenerator(req),
  message: {
    success: false,
    message: "Too many trade requests. Please slow down.",
  },
});

/* ── Prediction limiter ────────────────────────────────────── */
export const predictionLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             (req) => (req.user?.role === "premium" ? 30 : 5),
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => req.user?._id?.toString() || ipKeyGenerator(req),
  message: {
    success: false,
    message: "Prediction limit reached. Upgrade to Premium for more.",
    upgradeTo: "premium",
  },
});

/* ── Password reset limiter ────────────────────────────────── */
export const passwordResetLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             3,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many password reset attempts. Try again after 1 hour.",
  },
});

/* ── Admin limiter ─────────────────────────────────────────── */
export const adminLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => req.user?._id?.toString() || ipKeyGenerator(req),
  message: {
    success: false,
    message: "Too many admin requests. Please slow down.",
  },
});