/* ============================================================
   ROLE MIDDLEWARE
   Fine-grained role and permission checks.
   Always use AFTER protect middleware.
   ============================================================ */

/* ── Check specific roles ────────────────────────────────
   Usage: requireRole("admin", "premium")
   Passes if user has ANY of the listed roles               */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

/* ── Premium or Admin ────────────────────────────────────
   Passes if user is premium OR admin                       */
export const requirePremiumOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated.",
    });
  }

  if (req.user.role === "premium" || req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "This feature requires a Premium account.",
    upgradeTo: "premium",
  });
};

/* ── Owner or Admin ──────────────────────────────────────
   Passes if the requesting user owns the resource OR is admin.
   Usage: requireOwnerOrAdmin("userId") — param name in route
   Example route: /api/users/:userId/profile               */
export const requireOwnerOrAdmin = (paramName = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const resourceOwnerId = req.params[paramName];
    const isOwner         = req.user._id.toString() === resourceOwnerId;
    const isAdmin         = req.user.role === "admin";

    if (isOwner || isAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own resources.",
    });
  };
};

/* ── Check if user is banned ─────────────────────────────
   Extra safety check — use on sensitive routes             */
export const requireNotBanned = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated.",
    });
  }

  if (req.user.isBanned) {
    return res.status(403).json({
      success: false,
      message: "Your account has been suspended. Contact support.",
    });
  }

  next();
};

/* ── Attach role info to response headers ────────────────
   Optional — useful for frontend to know current role      */
export const attachRoleHeaders = (req, res, next) => {
  if (req.user) {
    res.setHeader("X-User-Role",    req.user.role);
    res.setHeader("X-User-Premium", req.user.role === "premium" ? "true" : "false");
  }
  next();
};