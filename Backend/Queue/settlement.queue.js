import { Queue } from "bullmq";
import { QUEUE_NAMES } from "../Utils/constants.js";

let settlementQueue = null;

export const initSettlementQueue = (redisConnection) => {
  settlementQueue = new Queue(QUEUE_NAMES.SETTLEMENT, {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail:     100,
      attempts:         3,
      backoff: { type: "exponential", delay: 3000 },
    },
  });
  console.log("✅ Settlement queue ready");
  return settlementQueue;
};

export const addSettlementJob = async (tradeData) => {
  if (!settlementQueue) throw new Error("Settlement queue not initialized");
  return await settlementQueue.add("settle-trade", tradeData, { priority: 1 });
};

export const getSettlementQueue = () => settlementQueue;