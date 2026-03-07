import { Queue } from "bullmq";
import { QUEUE_NAMES } from "../Utils/constants.js";

let simulationQueue = null;

export const initSimulationQueue = (redisConnection) => {
  simulationQueue = new Queue(QUEUE_NAMES.SIMULATION, {
    connection: redisConnection,
    defaultJobOptions: { removeOnComplete: 10, removeOnFail: 20 },
  });
  console.log("✅ Simulation queue ready");
  return simulationQueue;
};

export const getSimulationQueue = () => simulationQueue;