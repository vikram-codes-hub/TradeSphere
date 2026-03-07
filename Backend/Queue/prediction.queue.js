import { Queue } from "bullmq";
import { QUEUE_NAMES } from "../Utils/constants.js";

let predictionQueue = null;

export const initPredictionQueue = (redisConnection) => {
  predictionQueue = new Queue(QUEUE_NAMES.PREDICTION, {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: 20,
      removeOnFail:     50,
      attempts:         2,
      backoff: { type: "exponential", delay: 5000 },
    },
  });
  console.log("✅ Prediction queue ready");
  return predictionQueue;
};

export const addPredictionJob = async (data) => {
  if (!predictionQueue) throw new Error("Prediction queue not initialized");
  return await predictionQueue.add("run-prediction", data, { priority: 1 });
};

export const getPredictionQueue = () => predictionQueue;