import React, { useState, useEffect, useCallback } from "react";
import WatchlistHeader from "../Components/Watchlist/WatchlistHeader";
import WatchlistSummaryBar from "../Components/Watchlist/WatchlistSummaryBar";
import WatchlistCard from "../Components/Watchlist/WatchlistCard";
import EmptyWatchlist from "../Components/Watchlist/EmptyWatchlist";
import { mockWatchlist } from "../assets/Mockdata";

const WatchlistPage = () => {
  const [stocks, setStocks] = useState(mockWatchlist);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Default");
  const [lastTick, setLastTick] = useState(0);

  // Simulate live price ticks every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev =>
        prev.map(s => {
          const volatility = 0.003;
          const delta = s.currentPrice * volatility * (Math.random() * 2 - 1);
          const newPrice = parseFloat((s.currentPrice + delta).toFixed(2));
          const newChange = parseFloat((s.change + delta).toFixed(2));
          const newChangePct = parseFloat(((newChange / (newPrice - newChange)) * 100).toFixed(2));
          const newSparkline = [...s.sparkline.slice(1), newPrice];
          return { ...s, currentPrice: newPrice, change: newChange, changePct: newChangePct, sparkline: newSparkline };
        })
      );
      setLastTick(Date.now());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRemove = useCallback((symbol) => {
    setStocks(prev => prev.filter(s => s.symbol !== symbol));
  }, []);

  const handleSetAlert = useCallback((symbol, price) => {
    setStocks(prev => prev.map(s => s.symbol === symbol ? { ...s, alert: price } : s));
  }, []);

  const handleTrade = useCallback((symbol) => {
    // In real app: navigate(`/trade/${symbol}`)
    alert(`Navigating to trade page for ${symbol}`);
  }, []);

  const handleAddSymbol = useCallback((symbol) => {
    if (stocks.find(s => s.symbol === symbol)) return;
    const newStock = {
      symbol,
      name: `${symbol} Corp`,
      currentPrice: parseFloat((Math.random() * 2000 + 100).toFixed(2)),
      change: parseFloat((Math.random() * 20 - 10).toFixed(2)),
      changePct: parseFloat((Math.random() * 4 - 2).toFixed(2)),
      volume: `${(Math.random() * 3 + 0.2).toFixed(1)}M`,
      high: 0,
      low: 0,
      marketCap: "—",
      trend: ["bullish", "bearish", "neutral"][Math.floor(Math.random() * 3)],
      sparkline: Array.from({ length: 8 }, () => parseFloat((Math.random() * 200 + 800).toFixed(2))),
      alert: null,
    };
    newStock.high = parseFloat((newStock.currentPrice * 1.03).toFixed(2));
    newStock.low = parseFloat((newStock.currentPrice * 0.97).toFixed(2));
    setStocks(prev => [newStock, ...prev]);
  }, [stocks]);

  // Filter
  const filtered = stocks.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Price ↑") return a.currentPrice - b.currentPrice;
    if (sortBy === "Price ↓") return b.currentPrice - a.currentPrice;
    if (sortBy === "Change %") return b.changePct - a.changePct;
    if (sortBy === "Volume") return parseFloat(b.volume) - parseFloat(a.volume);
    return 0;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060d14",
      display: "flex",
      flexDirection: "column",
      fontFamily: "monospace",
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(#1e2d3d12 1px, transparent 1px),
          linear-gradient(90deg, #1e2d3d12 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column" }}>

          <WatchlistHeader
            count={stocks.length}
            onSearch={setSearch}
            onSort={setSortBy}
            sortBy={sortBy}
            onAddSymbol={handleAddSymbol}
          />

          {stocks.length > 0 && <WatchlistSummaryBar stocks={stocks} />}

          {/* Live pulse indicator */}
          {stocks.length > 0 && (
            <div style={{
              padding: "10px 32px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                boxShadow: "0 0 8px #22c55e",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1.5px" }}>
                PRICES UPDATING LIVE
              </span>
              {search && (
                <span style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", marginLeft: "16px" }}>
                  · {sorted.length} result{sorted.length !== 1 ? "s" : ""} for "{search}"
                </span>
              )}
            </div>
          )}

          {/* Stock Cards */}
          {sorted.length === 0 && stocks.length > 0 ? (
            <div style={{ padding: "40px 32px", textAlign: "center", color: "#4a6580", fontFamily: "monospace", fontSize: "13px" }}>
              No stocks match "{search}"
            </div>
          ) : sorted.length === 0 ? (
            <EmptyWatchlist onAdd={() => {}} />
          ) : (
            <div style={{ padding: "12px 32px 32px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {sorted.map(stock => (
                <WatchlistCard
                  key={stock.symbol}
                  stock={stock}
                  onRemove={handleRemove}
                  onSetAlert={handleSetAlert}
                  onTrade={handleTrade}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default WatchlistPage;