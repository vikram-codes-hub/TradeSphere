import { useState, useEffect } from "react";
import { useSocket }           from "./useSocket.js";

/*
  useTradeFeed(maxItems = 20)
  Returns { trades, clearFeed }
  Live feed of all trades across platform — used on Admin page + Dashboard
*/
export const useTradeFeed = (maxItems = 20) => {
  const socket = useSocket();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleTrade = (trade) => {
      setTrades((prev) => {
        const updated = [trade, ...prev];
        // Keep only latest maxItems trades
        return updated.slice(0, maxItems);
      });
    };

    socket.on("trade:executed", handleTrade);

    return () => {
      socket.off("trade:executed", handleTrade);
    };
  }, [socket, maxItems]);

  const clearFeed = () => setTrades([]);

  return { trades, clearFeed };
};

/*
  usePredictionNotify()
  Listens for prediction:ready + prediction:failed events
  Used on Predictions page
*/
export const usePredictionNotify = (onReady, onFailed) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const userId = JSON.parse(localStorage.getItem("user") || "{}")?._id;
    if (userId) socket.emit("joinUserRoom", userId);

    const handleReady  = (data) => onReady?.(data);
    const handleFailed = (data) => onFailed?.(data);

    socket.on("prediction:ready",  handleReady);
    socket.on("prediction:failed", handleFailed);

    return () => {
      socket.off("prediction:ready",  handleReady);
      socket.off("prediction:failed", handleFailed);
    };
  }, [socket, onReady, onFailed]);
};