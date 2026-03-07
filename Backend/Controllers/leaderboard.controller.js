import User      from "../Models/User.js";
import Trade     from "../Models/Trade.js";
import Portfolio from "../Models/Portfolio.js";
import { getRedisClient } from "../Config/redis.js";

/* ── Cache leaderboard in Redis for 5 minutes ────────────── */
const CACHE_KEY = "leaderboard:global";
const CACHE_TTL = 300; // 5 minutes

/* ============================================================
   GET LEADERBOARD
   GET /api/leaderboard
   Public
   ============================================================ */
export const getLeaderboard = async (req, res, next) => {
  try {
    const { type = "pnl", period = "all", limit = 20 } = req.query;
    const redisClient = getRedisClient();
    const cacheKey    = `leaderboard:${type}:${period}`;

    // Try Redis cache first
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success:  true,
          cached:   true,
          leaderboard: JSON.parse(cached),
        });
      }
    } catch (_) {}

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    if (period === "daily") {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: today } };
    } else if (period === "weekly") {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === "monthly") {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    let leaderboard = [];

    if (type === "pnl") {
      // Rank by total realized P&L from trades
      const stats = await Trade.aggregate([
        { $match: { type: "SELL", ...dateFilter } },
        {
          $group: {
            _id:           "$user",
            totalPnl:      { $sum: "$pnl" },
            totalTrades:   { $sum: 1 },
            winningTrades: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
            totalVolume:   { $sum: "$totalAmount" },
          },
        },
        { $sort: { totalPnl: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from:         "users",
            localField:   "_id",
            foreignField: "_id",
            as:           "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id:          0,
            userId:       "$_id",
            name:         "$user.name",
            avatar:       "$user.avatar",
            role:         "$user.role",
            totalPnl:     1,
            totalTrades:  1,
            winningTrades:1,
            totalVolume:  1,
            winRate: {
              $cond: [
                { $gt: ["$totalTrades", 0] },
                { $multiply: [{ $divide: ["$winningTrades", "$totalTrades"] }, 100] },
                0,
              ],
            },
          },
        },
      ]);
      leaderboard = stats;

    } else if (type === "winrate") {
      // Rank by win rate (min 5 trades to qualify)
      const stats = await Trade.aggregate([
        { $match: { type: "SELL", ...dateFilter } },
        {
          $group: {
            _id:           "$user",
            totalTrades:   { $sum: 1 },
            winningTrades: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
            totalPnl:      { $sum: "$pnl" },
          },
        },
        { $match: { totalTrades: { $gte: 5 } } }, // min 5 trades
        {
          $addFields: {
            winRate: {
              $multiply: [{ $divide: ["$winningTrades", "$totalTrades"] }, 100],
            },
          },
        },
        { $sort: { winRate: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users", localField: "_id", foreignField: "_id", as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0, userId: "$_id",
            name: "$user.name", avatar: "$user.avatar", role: "$user.role",
            winRate: 1, totalTrades: 1, winningTrades: 1, totalPnl: 1,
          },
        },
      ]);
      leaderboard = stats;

    } else if (type === "trades") {
      // Rank by most trades
      const stats = await Trade.aggregate([
        { $match: { ...dateFilter } },
        {
          $group: {
            _id:         "$user",
            totalTrades: { $sum: 1 },
            totalVolume: { $sum: "$totalAmount" },
            totalPnl:    { $sum: "$pnl" },
          },
        },
        { $sort: { totalTrades: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users", localField: "_id", foreignField: "_id", as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0, userId: "$_id",
            name: "$user.name", avatar: "$user.avatar", role: "$user.role",
            totalTrades: 1, totalVolume: 1, totalPnl: 1,
          },
        },
      ]);
      leaderboard = stats;
    }

    // Add rank numbers
    leaderboard = leaderboard.map((entry, i) => ({
      rank: i + 1,
      ...entry,
      totalPnl:   parseFloat((entry.totalPnl  || 0).toFixed(2)),
      winRate:    parseFloat((entry.winRate    || 0).toFixed(2)),
      totalVolume:parseFloat((entry.totalVolume|| 0).toFixed(2)),
    }));

    // Cache in Redis
    try {
      await redisClient.set(cacheKey, JSON.stringify(leaderboard), "EX", CACHE_TTL);
    } catch (_) {}

    res.status(200).json({
      success:     true,
      cached:      false,
      type,
      period,
      count:       leaderboard.length,
      leaderboard,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET MY RANK
   GET /api/leaderboard/me
   Protected
   ============================================================ */
export const getMyRank = async (req, res, next) => {
  try {
    const { period = "all" } = req.query;

    let dateFilter = {};
    if (period === "weekly") {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === "monthly") {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    // Get user's P&L
    const [myStats] = await Trade.aggregate([
      { $match: { user: req.user._id, type: "SELL", ...dateFilter } },
      {
        $group: {
          _id:           null,
          totalPnl:      { $sum: "$pnl" },
          totalTrades:   { $sum: 1 },
          winningTrades: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
        },
      },
    ]);

    if (!myStats) {
      return res.status(200).json({
        success: true,
        rank:    null,
        message: "No trades yet. Make some trades to appear on the leaderboard!",
      });
    }

    // Count users with higher P&L
    const usersAhead = await Trade.aggregate([
      { $match: { type: "SELL", ...dateFilter } },
      { $group: { _id: "$user", totalPnl: { $sum: "$pnl" } } },
      { $match: { totalPnl: { $gt: myStats.totalPnl } } },
      { $count: "count" },
    ]);

    const rank    = (usersAhead[0]?.count || 0) + 1;
    const winRate = myStats.totalTrades > 0
      ? parseFloat(((myStats.winningTrades / myStats.totalTrades) * 100).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      rank,
      stats: {
        totalPnl:     parseFloat(myStats.totalPnl.toFixed(2)),
        totalTrades:  myStats.totalTrades,
        winningTrades:myStats.winningTrades,
        winRate,
      },
    });
  } catch (err) {
    next(err);
  }
};