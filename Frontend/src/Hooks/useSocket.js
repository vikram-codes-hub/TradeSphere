import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Reuse existing connection if already connected
    if (socketInstance?.connected) {
      socketRef.current = socketInstance;
      return;
    }

    socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth:                 { token: localStorage.getItem("token") },
        transports:           ["websocket"],
        reconnection:         true,
        reconnectionDelay:    1000,
        reconnectionAttempts: 5,
      }
    );

    socketRef.current = socketInstance;

    socketInstance.on("connect",       () => console.log("⚡ Socket connected"));
    socketInstance.on("disconnect",    () => console.log("❌ Socket disconnected"));
    socketInstance.on("connect_error", (err) => console.error("Socket error:", err.message));

    return () => {
      // Don't disconnect on unmount — keep alive for session
    };
  }, []);

  return socketRef.current;
};

/* ── Call this on logout ─────────────────────────────────── */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};