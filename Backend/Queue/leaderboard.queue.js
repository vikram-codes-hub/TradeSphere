import { Queue } from "bullmq";
import { QUEUE_NAMES, CACHE_TTL } from "../Utils/constants.js";

let leaderboardQueue = null;

export const initLeaderboardQueue = (redisConnection) => {
  leaderboardQueue = new Queue(QUEUE_NAMES.LEADERBOARD, {
    connection: redisConnection,
    defaultJobOptions: { removeOnComplete: 5, removeOnFail: 10 },
  });

  // Refresh leaderboard cache every 5 minutes
  leaderboardQueue.add(
    "refresh-leaderboard",
    {},
    { repeat: { every: CACHE_TTL.LEADERBOARD * 1000 } }
  );

  console.log("✅ Leaderboard queue ready");
  return leaderboardQueue;
};

export const getLeaderboardQueue = () => leaderboardQueue;