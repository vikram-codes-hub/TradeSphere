import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { stockService }   from "../services/stockService";
import { watchlistService } from "../services/watchlistService";
import { useSocket }      from "../hooks/useSocket";

const MarketsContext = createContext(null);

export const MarketsProvider = ({ children }) => {
  const socket = useSocket();

  const [stocks,     setStocks]     = useState([]);
  const [watchlist,  setWatchlist]  = useState([]); // symbols user has saved
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastUpdated,setLastUpdated]= useState(null);

  // ── Filters ───────────────────────────────────────────
  const [search,  setSearch]  = useState("");
  const [sector,  setSector]  = useState("All");
  const [exchange,setExchange]= useState("All");
  const [sortBy,  setSortBy]  = useState("name"); // name | price | change | volume

  // ── Fetch all stocks ──────────────────────────────────
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockService.getAllStocks();
      setStocks(res?.stocks ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load stocks.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch watchlist symbols ───────────────────────────
  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await watchlistService.getWatchlist();
      const symbols = (res?.watchlist ?? []).map(w => w.symbol ?? w);
      setWatchlist(symbols);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchStocks();
    fetchWatchlist();
  }, [fetchStocks, fetchWatchlist]);

  // ── Socket — live price updates ───────────────────────
  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (data) => {
      // data: { symbol, price, change, changePercent, volume }
      setStocks(prev =>
        prev.map(s =>
          s.symbol === data.symbol
            ? { ...s, currentPrice: data.price, change: data.change, changePercent: data.changePercent, volume: data.volume ?? s.volume }
            : s
        )
      );
    };

    const handleHalt = ({ symbol }) => {
      setStocks(prev =>
        prev.map(s => s.symbol === symbol ? { ...s, isHalted: true } : s)
      );
    };

    const handleResume = ({ symbol }) => {
      setStocks(prev =>
        prev.map(s => s.symbol === symbol ? { ...s, isHalted: false } : s)
      );
    };

    socket.on("price:update",  handlePriceUpdate);
    socket.on("stock:halted",  handleHalt);
    socket.on("stock:resumed", handleResume);

    return () => {
      socket.off("price:update",  handlePriceUpdate);
      socket.off("stock:halted",  handleHalt);
      socket.off("stock:resumed", handleResume);
    };
  }, [socket]);

  // ── Watchlist toggle ──────────────────────────────────
  const toggleWatchlist = useCallback(async (symbol) => {
    const isInWatchlist = watchlist.includes(symbol);
    // Optimistic update
    setWatchlist(prev =>
      isInWatchlist ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(symbol);
      } else {
        await watchlistService.addToWatchlist(symbol);
      }
    } catch (_) {
      // Revert on failure
      setWatchlist(prev =>
        isInWatchlist ? [...prev, symbol] : prev.filter(s => s !== symbol)
      );
    }
  }, [watchlist]);

  // ── Derived — filtered + sorted stocks ───────────────
  const filteredStocks = stocks
    .filter(s => {
      const q = search.toLowerCase();
      const matchSearch   = !q || s.symbol.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q);
      const matchSector   = sector   === "All" || s.sector   === sector;
      const matchExchange = exchange === "All" || s.exchange === exchange;
      return matchSearch && matchSector && matchExchange;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":   return (b.currentPrice  ?? 0) - (a.currentPrice  ?? 0);
        case "change":  return (b.changePercent ?? 0) - (a.changePercent ?? 0);
        case "volume":  return (b.volume        ?? 0) - (a.volume        ?? 0);
        case "name":
        default:        return (a.symbol ?? "").localeCompare(b.symbol ?? "");
      }
    });

  // ── Derived — unique sectors + exchanges ──────────────
  const sectors   = ["All", ...new Set(stocks.map(s => s.sector).filter(Boolean))];
  const exchanges = ["All", ...new Set(stocks.map(s => s.exchange).filter(Boolean))];

  return (
    <MarketsContext.Provider value={{
      // data
      stocks: filteredStocks,
      allStocks: stocks,
      watchlist,
      sectors,
      exchanges,
      loading,
      error,
      lastUpdated,

      // filters
      search,  setSearch,
      sector,  setSector,
      exchange,setExchange,
      sortBy,  setSortBy,

      // actions
      refresh:         fetchStocks,
      toggleWatchlist,
    }}>
      {children}
    </MarketsContext.Provider>
  );
};

export const useMarkets = () => {
  const ctx = useContext(MarketsContext);
  if (!ctx) throw new Error("useMarkets must be used inside MarketsProvider");
  return ctx;
};