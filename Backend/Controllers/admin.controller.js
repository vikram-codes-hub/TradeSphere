import User       from "../Models/User.js";
import Trade      from "../Models/Trade.js";
import Stock      from "../Models/Stock.js";
import Prediction from "../Models/Prediction.js";
import Portfolio  from "../Models/Portfolio.js";
import { getRedisClient } from "../Config/redis.js";

/* ============================================================
   GET PLATFORM STATS
   GET /api/admin/stats
   ============================================================ */
export const getPlatformStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      premiumUsers,
      bannedUsers,
      newUsersToday,
      totalTrades,
      tradesToday,
      totalPredictions,
      predictionsToday,
      failedPredictions,
      haltedStocks,
      totalStocks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "premium" }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Trade.countDocuments(),
      Trade.countDocuments({ createdAt: { $gte: today } }),
      Prediction.countDocuments(),
      Prediction.countDocuments({ createdAt: { $gte: today } }),
      Prediction.countDocuments({ status: "FAILED" }),
      Stock.countDocuments({ isHalted: true }),
      Stock.countDocuments(),
    ]);

    // Total volume traded
    const [volumeStats] = await Trade.aggregate([
      { $group: { _id: null, totalVolume: { $sum: "$totalAmount" }, totalPnl: { $sum: "$pnl" } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total:    totalUsers,
          premium:  premiumUsers,
          free:     totalUsers - premiumUsers - bannedUsers,
          banned:   bannedUsers,
          newToday: newUsersToday,
        },
        trades: {
          total:       totalTrades,
          today:       tradesToday,
          totalVolume: parseFloat((volumeStats?.totalVolume || 0).toFixed(2)),
          totalPnl:    parseFloat((volumeStats?.totalPnl    || 0).toFixed(2)),
        },
        predictions: {
          total:  totalPredictions,
          today:  predictionsToday,
          failed: failedPredictions,
        },
        stocks: {
          total:   totalStocks,
          halted:  haltedStocks,
          active:  totalStocks - haltedStocks,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET ALL USERS
   GET /api/admin/users
   ============================================================ */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, banned } = req.query;

    let query = {};
    if (role)   query.role     = role;
    if (banned) query.isBanned = banned === "true";
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count:   users.length,
      total,
      page:    parseInt(page),
      pages:   Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET SINGLE USER DETAILS
   GET /api/admin/users/:id
   ============================================================ */
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    // Get their trade stats
    const [tradeStats] = await Trade.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id:         null,
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: "$totalAmount" },
          totalPnl:    { $sum: "$pnl" },
        },
      },
    ]);

    // Get their holdings count
    const holdingsCount = await Portfolio.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      user,
      tradeStats: tradeStats || { totalTrades: 0, totalVolume: 0, totalPnl: 0 },
      holdingsCount,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   UPDATE USER ROLE
   PUT /api/admin/users/:id/role
   Body: { role: "free" | "premium" | "admin" }
   ============================================================ */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["free", "premium", "admin"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role. Must be free, premium, or admin." });

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot change your own role." });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   BAN USER
   PUT /api/admin/users/:id/ban
   Body: { reason: "..." }
   ============================================================ */
export const banUser = async (req, res, next) => {
  try {
    const { reason = "Violated platform rules." } = req.body;

    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot ban yourself." });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: reason },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been banned.`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   UNBAN USER
   PUT /api/admin/users/:id/unban
   ============================================================ */
export const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: null },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been unbanned.`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   RESET USER BALANCE
   PUT /api/admin/users/:id/reset-balance
   ============================================================ */
export const resetUserBalance = async (req, res, next) => {
  try {
    const { amount = 100000 } = req.body;

    // Delete all their holdings too
    await Portfolio.deleteMany({ user: req.params.id });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        cashBalance:   amount,
        totalTrades:   0,
        winningTrades: 0,
        totalPnl:      0,
      },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({
      success: true,
      message: `Balance reset to ₹${amount.toLocaleString()} for ${user.name}.`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET ALL STOCKS
   GET /api/admin/stocks
   ============================================================ */
export const getAllStocks = async (req, res, next) => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 });
    res.status(200).json({ success: true, count: stocks.length, stocks });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   HALT / RESUME STOCK
   PUT /api/admin/stocks/:symbol/halt
   Body: { halt: true/false, reason: "..." }
   ============================================================ */
export const haltStock = async (req, res, next) => {
  try {
    const { halt = true, reason = "Administrative halt." } = req.body;
    const symbol = req.params.symbol.toUpperCase();

    const stock = await Stock.findOneAndUpdate(
      { symbol },
      {
        isHalted:   halt,
        haltReason: halt ? reason : null,
      },
      { new: true }
    );

    if (!stock)
      return res.status(404).json({ success: false, message: `Stock ${symbol} not found.` });

    // Broadcast via Socket.IO
    global.io?.emit(halt ? "stock:halted" : "stock:resumed", {
      symbol,
      reason: halt ? reason : null,
      time:   new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `${symbol} has been ${halt ? "halted" : "resumed"}.`,
      stock,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET RECENT TRADES (all users)
   GET /api/admin/trades
   ============================================================ */
export const getRecentTrades = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, symbol, type } = req.query;

    let query = {};
    if (symbol) query.symbol = symbol.toUpperCase();
    if (type)   query.type   = type.toUpperCase();

    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const total  = await Trade.countDocuments(query);
    const trades = await Trade.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count:   trades.length,
      total,
      page:    parseInt(page),
      pages:   Math.ceil(total / parseInt(limit)),
      trades,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   CLEAR REDIS CACHE
   DELETE /api/admin/cache
   ============================================================ */
export const clearCache = async (req, res, next) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.flushdb();

    res.status(200).json({
      success: true,
      message: "Redis cache cleared successfully.",
    });
  } catch (err) {
    next(err);
  }
};