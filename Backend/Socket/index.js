/* ============================================================
   SOCKET.IO HANDLER
   All socket event handlers in one place
   ============================================================ */

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // Join stock room for live price updates
    socket.on("joinStockRoom", (symbol) => {
      socket.join(`stock:${symbol}`);
      console.log(`📌 ${socket.id} joined stock:${symbol}`);
    });

    // Leave stock room
    socket.on("leaveStockRoom", (symbol) => {
      socket.leave(`stock:${symbol}`);
    });

    // Join personal room for prediction notifications
    socket.on("joinUserRoom", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`👤 ${socket.id} joined user:${userId}`);
    });

    socket.on("leaveUserRoom", (userId) => {
      socket.leave(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Socket.IO handlers initialized");
};