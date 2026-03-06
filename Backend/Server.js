import dotenv from "dotenv";
dotenv.config();

import http           from "http";
import { Server }     from "socket.io";
import { app }        from "./app.js";
import { connectDB }  from "./Config/ConnectDB.js";
import { initRedis }  from "./Config/redis.js";
import { seedStocks } from "./Services/Stockservice.js";
import {
  initMarketSyncQueue,
  initMarketSyncWorker,
  triggerImmediateSync,
} from "./workers/marketSyncWorker.js";

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);

// /* ── Socket.IO
const io = new Server(server, {
  cors: {
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    methods:     ["GET", "POST"],
    credentials: true,
  },
});

//  io globally accessible so controllers can emit events
global.io = io;

io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Frontend calls: socket.emit("joinStockRoom", "TSLA")
  // Must match marketSyncWorker: io.to(`stock:${symbol}`)
  socket.on("joinStockRoom", (symbol) => {
    socket.join(`stock:${symbol}`);
    console.log(`📌 ${socket.id} joined room: stock:${symbol}`);
  });

  socket.on("leaveStockRoom", (symbol) => {
    socket.leave(`stock:${symbol}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

/* ── Start server ────────────────────────────────────────── */
const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Connect Redis — 
    const { redisClient, redisConnection } = await initRedis();

    // 3. Seed stocks into DB if not already there
    await seedStocks();

    // 4. Start BullMQ market sync queue
    await initMarketSyncQueue(redisConnection);

    // 5. Start BullMQ worker — needs io for Socket.IO broadcasts
    initMarketSyncWorker(redisConnection, redisClient, io);

    // 6. Trigger first sync immediately on startup
    await triggerImmediateSync();

    // 7. Start HTTP server
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🔄 Market sync worker started\n`);
    });

  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
};

/* ── Graceful shutdown ───────────────────────────────────── */
process.on("SIGTERM", async () => {
  console.log("⚠️  SIGTERM received — shutting down gracefully");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});

startServer();