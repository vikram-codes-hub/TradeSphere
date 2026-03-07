import { useState, useEffect } from "react";
import { useSocket }           from "./useSocket.js";

/*
  useStockPrice("TSLA", 2450.00)
  Returns { price, change, changePct, isHalted, updatedAt }
  Auto-updates whenever backend emits "price:update" for that symbol
*/
export const useStockPrice = (symbol, initialPrice = null) => {
  const socket = useSocket();

  const [priceData, setPriceData] = useState({
    price:     initialPrice,
    change:    0,
    changePct: 0,
    isHalted:  false,
    updatedAt: null,
  });

  useEffect(() => {
    if (!socket || !symbol) return;

    const sym = symbol.toUpperCase();

    // Join stock room to receive updates for this symbol
    socket.emit("joinStockRoom", sym);

    // Listen for price updates
    const handlePriceUpdate = (data) => {
      if (data.symbol !== sym) return;
      setPriceData({
        price:     data.price,
        change:    data.change    || 0,
        changePct: data.changePct || 0,
        isHalted:  data.isHalted  || false,
        updatedAt: data.time      || new Date().toISOString(),
      });
    };

    // Listen for halt/resume events
    const handleHalted  = (data) => {
      if (data.symbol !== sym) return;
      setPriceData((prev) => ({ ...prev, isHalted: true }));
    };

    const handleResumed = (data) => {
      if (data.symbol !== sym) return;
      setPriceData((prev) => ({ ...prev, isHalted: false }));
    };

    socket.on("price:update",   handlePriceUpdate);
    socket.on("stock:halted",   handleHalted);
    socket.on("stock:resumed",  handleResumed);

    return () => {
      // Leave room and remove listeners on unmount
      socket.emit("leaveStockRoom", sym);
      socket.off("price:update",  handlePriceUpdate);
      socket.off("stock:halted",  handleHalted);
      socket.off("stock:resumed", handleResumed);
    };
  }, [socket, symbol]);

  return priceData;
};