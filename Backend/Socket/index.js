/* ============================================================
   SOCKET.IO HANDLER
   ============================================================ */

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // ── User room (for predictions + personal notifications) ─
    // AuthContext emits "joinUserRoom"
    socket.on("joinUserRoom", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`👤 ${socket.id} joined user:${userId}`);
    });

    socket.on("leaveUserRoom", (userId) => {
      socket.leave(`user:${userId}`);
    });

    // ── Stock rooms — TradePage/WatchlistPage use these ──────
    // Support BOTH naming conventions for compatibility
    socket.on("subscribe:stock", (symbol) => {
      socket.join(`stock:${symbol}`);
    });

    socket.on("unsubscribe:stock", (symbol) => {
      socket.leave(`stock:${symbol}`);
    });

    // Legacy names (keep for backward compat)
    socket.on("joinStockRoom", (symbol) => {
      socket.join(`stock:${symbol}`);
    });

    socket.on("leaveStockRoom", (symbol) => {
      socket.leave(`stock:${symbol}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Socket.IO handlers initialized");
};