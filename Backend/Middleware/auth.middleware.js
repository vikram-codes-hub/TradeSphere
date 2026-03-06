import jwt  from "jsonwebtoken";
import User from "../Models/User.js";

/* ============================================================
   PROTECT — verifies JWT, attaches req.user
   ============================================================ */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is valid but user no longer exists.",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support.",
      });
    }

    req.user = user;
    next();

  } catch (err) {               // ← fixed: was "error" then used "err"
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(500).json({ success: false, message: "Authentication error." });
  }
};

/* ============================================================
   REQUIRE PREMIUM — use after protect
   ============================================================ */
export const requirePremium = (req, res, next) => {
  if (req.user?.role === "premium" || req.user?.role === "admin") {
    return next(); // admins can access premium features too
  }
  return res.status(403).json({
    success:   false,
    message:   "This feature requires a Premium account.",
    upgradeTo: "premium",
  });
};

/* ============================================================
   REQUIRE ADMIN — use after protect
   ============================================================ */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Admin access required.",
  });
};