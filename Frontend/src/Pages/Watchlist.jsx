import { useState, useEffect, useCallback } from "react";
import { useNavigate }          from "react-router-dom";
import { watchlistService }     from "../services/watchlistService";
import { stockService }         from "../services/stockService";
import { useSocket }            from "../Hooks/useSocket";
import WatchlistHeader          from "../Components/Watchlist/WatchlistHeader";
import WatchlistSummaryBar      from "../Components/Watchlist/WatchlistSummaryBar";
import WatchlistCard            from "../Components/Watchlist/WatchlistCard";
import EmptyWatchlist           from "../Components/Watchlist/EmptyWatchlist";

/* Normalise a stock entry from the API into the shape WatchlistCard expects */
const normalise = (item) => {
  const s = item.stock ?? item; // API may return { stock: {...} } or stock directly
  return {
    symbol:       s.symbol,
    name:         s.companyName ?? s.name ?? s.symbol,
    currentPrice: s.currentPrice ?? s.price ?? 0,
    change:       s.priceChange  ?? s.change ?? 0,
    changePct:    s.priceChangePct ?? s.changePct ?? 0,
    high:         s.dayHigh  ?? s.high  ?? 0,
    low:          s.dayLow   ?? s.low   ?? 0,
    volume:       s.volume   != null ? `${(s.volume / 1_000_000).toFixed(1)}M` : "—",
    marketCap:    s.marketCap != null ? `₹${(s.marketCap / 1e9).toFixed(1)}B` : "—",
    trend:        s.trend ?? (s.priceChangePct > 1 ? "bullish" : s.priceChangePct < -1 ? "bearish" : "neutral"),
    sparkline:    s.sparkline ?? [],
    alert:        item.alert ?? null,
  };
};

const WatchlistPage = () => {
  const navigate          = useNavigate();
  const socket            = useSocket();
  const [stocks,   setStocks]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sortBy,   setSortBy]   = useState("Default");
  const [addLoading, setAddLoading] = useState(false);
  const [error,    setError]    = useState(null);

  // ── Load watchlist ─────────────────────────────────────
  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res    = await watchlistService.getWatchlist();
      const items  = res?.watchlist ?? res?.stocks ?? res?.items ?? [];
      setStocks(items.map(normalise));
    } catch (err) {
      setError("Failed to load watchlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  // ── Socket: live price updates ─────────────────────────
  useEffect(() => {
    if (!socket || stocks.length === 0) return;

    // Subscribe to each symbol
    stocks.forEach(s => socket.emit("subscribe:stock", s.symbol));

    const onPriceUpdate = ({ symbol, currentPrice, priceChange, priceChangePct, dayHigh, dayLow }) => {
      setStocks(prev => prev.map(s => {
        if (s.symbol !== symbol) return s;
        return {
          ...s,
          currentPrice: currentPrice ?? s.currentPrice,
          change:       priceChange  ?? s.change,
          changePct:    priceChangePct ?? s.changePct,
          high:         dayHigh ?? s.high,
          low:          dayLow  ?? s.low,
          sparkline:    [...(s.sparkline.slice(-19)), currentPrice ?? s.currentPrice],
          trend:        (priceChangePct ?? s.changePct) > 1 ? "bullish" : (priceChangePct ?? s.changePct) < -1 ? "bearish" : "neutral",
        };
      }));
    };

    socket.on("price:update", onPriceUpdate);
    return () => {
      stocks.forEach(s => socket.emit("unsubscribe:stock", s.symbol));
      socket.off("price:update", onPriceUpdate);
    };
  }, [socket, stocks.length]);

  // ── Add symbol ─────────────────────────────────────────
  const handleAddSymbol = useCallback(async (symbol) => {
    if (stocks.find(s => s.symbol === symbol)) return;
    setAddLoading(true);
    try {
      await watchlistService.add(symbol);
      // Fetch live stock data for the new symbol
      const stockData = await stockService.getStock(symbol).catch(() => null);
      if (stockData) {
        setStocks(prev => [normalise(stockData), ...prev]);
      } else {
        await loadWatchlist(); // fallback — reload all
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to add symbol.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddLoading(false);
    }
  }, [stocks, loadWatchlist]);

  // ── Remove symbol ──────────────────────────────────────
  const handleRemove = useCallback(async (symbol) => {
    // Optimistic update
    setStocks(prev => prev.filter(s => s.symbol !== symbol));
    try {
      await watchlistService.remove(symbol);
    } catch {
      loadWatchlist(); // revert on error
    }
  }, [loadWatchlist]);

  // ── Set alert (local only — no API endpoint for alerts) ─
  const handleSetAlert = useCallback((symbol, price) => {
    setStocks(prev => prev.map(s => s.symbol === symbol ? { ...s, alert: price } : s));
  }, []);

  // ── Trade ──────────────────────────────────────────────
  const handleTrade = useCallback((symbol) => {
    navigate(`/trade/${symbol}`);
  }, [navigate]);

  // ── Filter + Sort ──────────────────────────────────────
  const filtered = stocks.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Price ↑")  return a.currentPrice - b.currentPrice;
    if (sortBy === "Price ↓")  return b.currentPrice - a.currentPrice;
    if (sortBy === "Change %") return b.changePct - a.changePct;
    if (sortBy === "Volume")   return parseFloat(b.volume) - parseFloat(a.volume);
    return 0;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#060d14", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      {/* Grid bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(#1e2d3d12 1px,transparent 1px),linear-gradient(90deg,#1e2d3d12 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column" }}>

          <WatchlistHeader
            count={stocks.length}
            onSearch={setSearch}
            onSort={setSortBy}
            sortBy={sortBy}
            onAddSymbol={handleAddSymbol}
            addLoading={addLoading}
          />

          {/* Error banner */}
          {error && (
            <div style={{ margin: "12px 32px 0", padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "13px", fontFamily: "monospace" }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", border: "3px solid #1e2d3d", borderTop: "3px solid #f0b429", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <div style={{ color: "#4a6580", fontFamily: "monospace", fontSize: "13px" }}>Loading watchlist...</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            <>
              {stocks.length > 0 && <WatchlistSummaryBar stocks={stocks} />}

              {stocks.length > 0 && (
                <div style={{ padding: "10px 32px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e", animation: "pulse 2s infinite" }} />
                  <span style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1.5px" }}>PRICES UPDATING LIVE</span>
                  {search && <span style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", marginLeft: "16px" }}>· {sorted.length} result{sorted.length !== 1 ? "s" : ""} for "{search}"</span>}
                </div>
              )}

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
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

export default WatchlistPage;