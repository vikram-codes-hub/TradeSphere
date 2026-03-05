import { Worker, Queue, QueueScheduler } from "bullmq";
import { syncAllStocks, cacheStockPrice } from "../Services/Stockservice.js";

/* ============================================================
   MARKET SYNC WORKER
   BullMQ repeatable job — runs every 60 seconds.
   Fetches prices → updates DB → caches Redis → broadcasts Socket.IO
   ============================================================ */

const QUEUE_NAME    = "market-sync";
const JOB_NAME      = "sync-all-prices";
const SYNC_INTERVAL = 60 * 1000; // 60 seconds

let marketSyncQueue  = null;
let marketSyncWorker = null;
let marketScheduler  = null;

/* ============================================================
   INIT QUEUE — call once after Redis connects in server.js
   ============================================================ */
export const initMarketSyncQueue = async (redisConnection) => {
  try {
    marketScheduler = new QueueScheduler(QUEUE_NAME, {
      connection: redisConnection,
    });

    marketSyncQueue = new Queue(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail:     50,
        attempts:         3,
        backoff: { type: "exponential", delay: 5000 },
      },
    });

    // Clean up old repeatable jobs on restart
    const repeatableJobs = await marketSyncQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await marketSyncQueue.removeRepeatableByKey(job.key);
    }

    // Register repeatable job
    await marketSyncQueue.add(
      JOB_NAME,
      { triggeredAt: new Date().toISOString() },
      {
        repeat: { every: SYNC_INTERVAL },
        jobId:  "market-sync-repeatable",
      }
    );

    console.log(`✅ Market sync queue ready (every ${SYNC_INTERVAL / 1000}s)`);
    return marketSyncQueue;
  } catch (err) {
    console.error("❌ Failed to init market sync queue:", err.message);
    throw err;
  }
};

/* ============================================================
   INIT WORKER — call once in server.js with io + redisClient
   ============================================================ */
export const initMarketSyncWorker = (redisConnection, redisClient, io) => {
  marketSyncWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      console.log(`\n⚡ Market sync started [${new Date().toISOString()}]`);

      /* Step 1 — Sync all from Yahoo Finance */
      const results = await syncAllStocks();
      if (!results || results.length === 0) {
        console.warn("⚠️  No stocks synced");
        return;
      }

      const updates = [];

      /* Step 2 — Cache + emit via Socket.IO */
      for (const result of results) {
        if (!result?.stock) continue;

        const { stock, wasResumed, priceChanged } = result;

        // Cache in Redis
        await cacheStockPrice(redisClient, stock.symbol, stock.currentPrice);

        const payload = {
          symbol:         stock.symbol,
          companyName:    stock.companyName,
          currentPrice:   stock.currentPrice,
          previousClose:  stock.previousClose,
          priceChange:    parseFloat((stock.currentPrice - stock.previousClose).toFixed(2)),
          priceChangePct: parseFloat(
            (((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2)
          ),
          volume:         stock.volume,
          marketCap:      stock.marketCap,
          isHalted:       stock.isHalted,
          lastSyncedAt:   stock.lastSyncedAt,
        };

        updates.push(payload);

        // Emit to users watching this stock
        if (priceChanged) {
          io.to(`stock:${stock.symbol}`).emit("price:update", payload);
        }

        // Circuit breaker events
        if (stock.isHalted && !wasResumed) {
          io.emit("market:halted", {
            symbol:   stock.symbol,
            reason:   stock.haltReason,
            haltedAt: stock.haltedAt,
            resumeAt: stock.haltedUntil,
          });
          console.warn(`🔴 market:halted emitted for ${stock.symbol}`);
        }

        if (wasResumed) {
          io.emit("market:resumed", { symbol: stock.symbol });
          console.log(`🟢 market:resumed emitted for ${stock.symbol}`);
        }
      }

      /* Step 3 — Full market update for market page */
      io.emit("market:update", {
        stocks:   updates,
        syncedAt: new Date().toISOString(),
      });

      console.log(`✅ Sync complete — ${updates.length} stocks broadcast\n`);
    },
    {
      connection:  redisConnection,
      concurrency: 1,
    }
  );

  marketSyncWorker.on("completed", (job) => console.log(`✅ Job ${job.id} done`));
  marketSyncWorker.on("failed",    (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));
  marketSyncWorker.on("error",     (err)      => console.error("❌ Worker error:", err.message));

  console.log("✅ Market sync worker started");
  return marketSyncWorker;
};

/* ============================================================
   TRIGGER IMMEDIATE SYNC — call on server startup
   ============================================================ */
export const triggerImmediateSync = async () => {
  if (!marketSyncQueue) {
    console.warn("⚠️  Queue not ready");
    return;
  }
  await marketSyncQueue.add(
    JOB_NAME,
    { triggeredAt: new Date().toISOString(), immediate: true },
    { priority: 1 }
  );
  console.log("⚡ Immediate sync triggered");
};

/* ============================================================
   GRACEFUL SHUTDOWN
   ============================================================ */
export const shutdownMarketSync = async () => {
  try {
    if (marketSyncWorker) await marketSyncWorker.close();
    if (marketSyncQueue)  await marketSyncQueue.close();
    if (marketScheduler)  await marketScheduler.close();
    console.log("✅ Market sync shutdown complete");
  } catch (err) {
    console.error("❌ Shutdown error:", err.message);
  }
};