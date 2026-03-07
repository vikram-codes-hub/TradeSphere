import { Worker } from "bullmq";
import Trade       from "../Models/Trade.js";
import { QUEUE_NAMES } from "../Utils/constants.js";
import { getRedisClient } from "../Config/redis.js";

let leaderboardWorker = null;

export const initLeaderboardWorker = (redisConnection) => {
  leaderboardWorker = new Worker(
    QUEUE_NAMES.LEADERBOARD,
    async (job) => {
      console.log("🏆 Refreshing leaderboard cache...");
      const redisClient = getRedisClient();

      // Rebuild top 20 P&L leaderboard
      const stats = await Trade.aggregate([
        { $match: { type: "SELL" } },
        {
          $group: {
            _id:           "$user",
            totalPnl:      { $sum: "$pnl" },
            totalTrades:   { $sum: 1 },
            winningTrades: { $sum: { $cond: [{ $gt: ["$pnl", 0] }, 1, 0] } },
          },
        },
        { $sort: { totalPnl: -1 } },
        { $limit: 20 },
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
            totalPnl: 1, totalTrades: 1, winningTrades: 1,
          },
        },
      ]);

      const leaderboard = stats.map((e, i) => ({ rank: i + 1, ...e }));
      await redisClient.set("leaderboard:pnl:all", JSON.stringify(leaderboard), "EX", 300);

      console.log("✅ Leaderboard cache refreshed");
    },
    { connection: redisConnection, concurrency: 1 }
  );

  leaderboardWorker.on("failed", (job, err) => console.error(`❌ Leaderboard job failed:`, err.message));
  console.log("✅ Leaderboard worker started");
  return leaderboardWorker;
};