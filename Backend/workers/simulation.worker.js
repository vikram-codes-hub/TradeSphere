import { Worker } from "bullmq";
import { QUEUE_NAMES } from "../Utils/constants.js";

let simulationWorker = null;

// Simulation worker — for future paper trading simulations
export const initSimulationWorker = (redisConnection) => {
  simulationWorker = new Worker(
    QUEUE_NAMES.SIMULATION,
    async (job) => {
      console.log(`🎮 Running simulation job ${job.id}`);
      // Future: auto-trading simulations, backtesting, etc.
    },
    { connection: redisConnection, concurrency: 2 }
  );

  simulationWorker.on("failed", (job, err) => console.error(`❌ Simulation job failed:`, err.message));
  console.log("✅ Simulation worker started");
  return simulationWorker;
};