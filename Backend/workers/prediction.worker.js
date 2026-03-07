import { Worker } from "bullmq";
import Prediction  from "../Models/Prediction.js";
import { QUEUE_NAMES } from "../Utils/constants.js";
import axios from "axios";

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

        const mlResponse = await axios.post(
          `${process.env.ML_SERVICE_URL}/predict`,
          { symbol },
          { timeout: 30000 }
        );

        const mlData = mlResponse.data;
        prediction.complete({
          predictedPrice: mlData.predicted_price,
          trend:          mlData.trend,
          pctChange:      mlData.pct_change,
          confidence:     mlData.confidence,
          modelUsed:      mlData.model_used,
          rmse:           mlData.rmse,
          r2:             mlData.r2,
        });

        if (mlData.price_history) {
          prediction.priceHistory    = mlData.price_history;
          prediction.inputDataPoints = mlData.price_history.length;
        }

        await prediction.save();

        // Notify user via Socket.IO
        global.io?.to(`user:${prediction.user}`).emit("prediction:ready", {
          predictionId: prediction._id,
          symbol,
          status: "COMPLETED",
        });

        console.log(`✅ Prediction complete for ${symbol}`);
      } catch (err) {
        prediction.fail(err.message);
        await prediction.save();
        throw err;
      }
    },
    { connection: redisConnection, concurrency: 3 }
  );

  predictionWorker.on("completed", (job) => console.log(`✅ Prediction job ${job.id} done`));
  predictionWorker.on("failed",    (job, err) => console.error(`❌ Prediction job ${job?.id} failed:`, err.message));

  console.log("✅ Prediction worker started");
  return predictionWorker;
};