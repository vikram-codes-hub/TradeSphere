import { Worker } from "bullmq";
import Prediction  from "../Models/Prediction.js";
import { QUEUE_NAMES } from "../Utils/constants.js";
import { requestMLPrediction } from "../Services/mlBridge.service.js";

let predictionWorker = null;

export const initPredictionWorker = (redisConnection) => {
  predictionWorker = new Worker(
    QUEUE_NAMES.PREDICTION,
    async (job) => {
      const { predictionId, symbol } = job.data;
      console.log(`🤖 Processing prediction for ${symbol}`);

      const prediction = await Prediction.findById(predictionId);
      if (!prediction) throw new Error(`Prediction ${predictionId} not found`);

      try {
        prediction.status = "PROCESSING";
        await prediction.save();

        // mlData is already unwrapped from { success, data: { ... } }
        const mlData = await requestMLPrediction(symbol);

        // ✅ camelCase keys matching prediction_service.py response
        prediction.complete({
          predictedPrice: mlData.predictedPrice,
          trend:          mlData.trend,
          pctChange:      mlData.pctChange,
          confidence:     mlData.confidence,
          modelUsed:      mlData.modelUsed,
          rmse:           mlData.rmse,
          r2:             mlData.r2,
        });

        prediction.inputDataPoints = mlData.dataPoints || 0;
        await prediction.save();

        global.io?.to(`user:${prediction.user}`).emit("prediction:ready", {
          predictionId: prediction._id,
          symbol,
          status:       "COMPLETED",
        });

        console.log(`✅ Prediction complete for ${symbol} — ₹${mlData.currentPrice} → ₹${mlData.predictedPrice} (${mlData.trend})`);

      } catch (err) {
        prediction.fail(err.message);
        await prediction.save();

        global.io?.to(`user:${prediction.user}`).emit("prediction:failed", {
          predictionId: prediction._id,
          symbol,
          error:        err.message,
        });

        throw err; // let BullMQ handle retry
      }
    },
    { connection: redisConnection, concurrency: 3 }
  );

  predictionWorker.on("completed", (job) =>
    console.log(`✅ Prediction job ${job.id} done`)
  );
  predictionWorker.on("failed", (job, err) =>
    console.error(`❌ Prediction job ${job?.id} failed:`, err.message)
  );

  console.log("✅ Prediction worker started");
  return predictionWorker;
};