import dotenv from "dotenv";
dotenv.config();

import http           from "http";
import { Server }     from "socket.io";
import { app }        from "./app.js";
import { connectDB }  from "./Config/ConnectDB.js";
import { initRedis }  from "./Config/redis.js";
import { seedStocks } from "./Services/Stockservice.js";
import { initSocket } from "./Socket/index.js";

// Market sync
import {
  initMarketSyncQueue,
  initMarketSyncWorker,
  triggerImmediateSync,
} from "./Workers/marketSyncWorker.js";

// New queues
import { initPredictionQueue }  from "./Queue/prediction.queue.js";
import { initLeaderboardQueue } from "./Queue/leaderboard.queue.js";
import { initSettlementQueue }  from "./Queue/settlement.queue.js";
import { initSimulationQueue }  from "./Queue/simulation.queue.js";

// New workers
import { initPredictionWorker }  from "./Workers/prediction.worker.js";
import { initLeaderboardWorker } from "./Workers/leaderboard.worker.js";
import { initSettlementWorker }  from "./Workers/settlement.worker.js";
import { initSimulationWorker }  from "./Workers/simulation.worker.js";

const PORT = process.env.PORT || 5000;

/* ── HTTP server ─────────────────────────────────────────── */
const server = http.createServer(app);

/* ── Socket.IO ───────────────────────────────────────────── */
const io = new Server(server, {
  cors: {
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    methods:     ["GET", "POST"],
    credentials: true,
  },
});

global.io = io;
initSocket(io); // ← uses Socket/index.js instead of inline handlers

/* ── Banner ──────────────────────────────────────────────── */
const printBanner = ({ mongoHost, redisHost, stocks, port, mlHost }) => {
  const line  = "─".repeat(52);
  const green = (t) => `\x1b[32m${t}\x1b[0m`;
  const cyan  = (t) => `\x1b[36m${t}\x1b[0m`;
  const bold  = (t) => `\x1b[1m${t}\x1b[0m`;
  const dim   = (t) => `\x1b[2m${t}\x1b[0m`;
  const yellow= (t) => `\x1b[33m${t}\x1b[0m`;

  console.log(`
${cyan("  ████████╗██████╗  █████╗ ██████╗ ███████╗")}
${cyan("     ██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝")}
${cyan("     ██║   ██████╔╝███████║██║  ██║█████╗  ")}
${cyan("     ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝  ")}
${cyan("     ██║   ██║  ██║██║  ██║██████╔╝███████╗")}
${cyan("     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝")}
${cyan("  ███████╗██████╗ ██╗  ██╗███████╗██████╗ ███████╗")}
${cyan("  ██╔════╝██╔══██╗██║  ██║██╔════╝██╔══██╗██╔════╝")}
${cyan("  ███████╗██████╔╝███████║█████╗  ██████╔╝█████╗  ")}
${cyan("  ╚════██║██╔═══╝ ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ")}
${cyan("  ███████║██║     ██║  ██║███████╗██║  ██║███████╗")}
${cyan("  ╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝")}

  ${bold("TradeSphere")} ${dim("v1.0.0")}  ${yellow("[ Paper Trading Platform ]")}
  ${line}
  ${green("✅")} MongoDB    ${dim("→")} ${dim(mongoHost)}
  ${green("✅")} Redis      ${dim("→")} ${dim(redisHost)}
  ${green("✅")} Stocks     ${dim("→")} ${green(stocks + " symbols syncing")}
  ${green("✅")} BullMQ    ${dim("→")} ${dim("5 queues active")}
  ${green("✅")} Workers   ${dim("→")} ${dim("5 workers running")}
  ${green("✅")} Socket.IO  ${dim("→")} ${dim("live price broadcast ready")}
  ${line}
  ${green("🚀")} ${bold("Server")}    ${dim("→")} http://localhost:${bold(port)}
  ${green("📡")} ${bold("API Base")}  ${dim("→")} http://localhost:${bold(port)}/api
  ${green("🏥")} ${bold("Health")}    ${dim("→")} http://localhost:${bold(port)}/api/health
  ${green("🏥")} ${bold("ML Health")}    ${dim("→")} http://localhost:${bold(mlHost)}/api/health
  ${line}
  ${dim("Press Ctrl+C to stop")}
`);
};

/* ── Start server ────────────────────────────────────────── */
const startServer = async () => {
  try {
    // Silence non-critical warnings during startup
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const msg = args[0]?.toString() || "";
      if (msg.includes("IMPORTANT") || msg.includes("Eviction")) return;
      originalWarn(...args);
    };

    process.stdout.write("\x1Bc");
    console.log("\n  \x1b[2mStarting TradeSphere...\x1b[0m\n");

    // 1. Connect MongoDB
    await connectDB();

    // 2. Connect Redis
    const { redisClient, redisConnection } = await initRedis();

    // 3. Seed stocks
    await seedStocks();

    // 4. Init all queues
    await initMarketSyncQueue(redisConnection);
    await initPredictionQueue(redisConnection);
    await initLeaderboardQueue(redisConnection);
    await initSettlementQueue(redisConnection);
    await initSimulationQueue(redisConnection);

    // 5. Init all workers
    initMarketSyncWorker(redisConnection, redisClient, io);
    initPredictionWorker(redisConnection);
    initLeaderboardWorker(redisConnection);
    initSettlementWorker(redisConnection);
    initSimulationWorker(redisConnection);

    // 6. Trigger immediate market sync
    await triggerImmediateSync();

    // Restore console.warn
    console.warn = originalWarn;

    // 7. Start HTTP server
    server.listen(PORT, () => {
      printBanner({
        mongoHost: process.env.MONGO_URI?.split("@")[1]?.split("/")[0] || "MongoDB Atlas",
        redisHost: process.env.REDIS_HOST?.split(".")[0] + ".redis-cloud" || "Redis Cloud",
        stocks:    "14",
        port:      PORT,
        mlHost:   5001
      });
    });

  } catch (error) {
    console.error("\n\x1b[31m❌ Server startup failed:\x1b[0m", error.message);
    process.exit(1);
  }
};

/* ── Graceful shutdown ───────────────────────────────────── */
process.on("SIGTERM", async () => {
  console.log("\n\x1b[33m⚠️  Shutting down gracefully...\x1b[0m");
  server.close(() => {
    console.log("\x1b[32m✅ Server closed\x1b[0m");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("\n\x1b[33m⚠️  Shutting down gracefully...\x1b[0m");
  server.close(() => {
    console.log("\x1b[32m✅ Server closed\x1b[0m");
    process.exit(0);
  });
});

startServer();