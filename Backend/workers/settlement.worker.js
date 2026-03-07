import { Worker } from "bullmq";
import { QUEUE_NAMES } from "../Utils/constants.js";

let settlementWorker = null;

// Settlement worker handles post-trade processing
// e.g. updating stats, sending notifications, etc.
export const initSettlementWorker = (redisConnection) => {
  settlementWorker = new Worker(
    QUEUE_NAMES.SETTLEMENT,
    async (job) => {
      const { userId, tradeId, type, symbol, pnl } = job.data;
      console.log(`💰 Settling trade ${tradeId} for user ${userId}`);
      // Future: send email notification, update leaderboard, etc.
    },
    { connection: redisConnection, concurrency: 5 }
  );

  settlementWorker.on("failed", (job, err) => console.error(`❌ Settlement job failed:`, err.message));
  console.log("✅ Settlement worker started");
  return settlementWorker;
};