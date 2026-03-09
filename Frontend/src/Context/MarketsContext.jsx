import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { stockService }     from "../services/stockService";
import { watchlistService } from "../services/watchlistService";
import { useSocket }        from "../hooks/useSocket";

const MarketsContext = createContext(null);
const PAGE_SIZE = 20;

export const MarketsProvider = ({ children }) => {
  const socket = useSocket();

  const [allStocks,   setAllStocks]   = useState([]);
  const [watchlist,   setWatchlist]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searching,   setSearching]   = useState(false);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [page,        setPage]        = useState(1); // pagination

  // ── Filters ───────────────────────────────────────────
  const [search,   setSearch]   = useState("");
  const [exchange, setExchange] = useState("All");
  const [sortBy,   setSortBy]   = useState("marketCap");

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, exchange, sortBy]);

  // ── Fetch all stocks ──────────────────────────────────
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockService.getAllStocks();
      setAllStocks(res?.stocks ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load stocks.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res     = await watchlistService.getWatchlist();
      const symbols = (res?.watchlist ?? []).map(w => w.symbol ?? w);
      setWatchlist(symbols);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchStocks();
    fetchWatchlist();
  }, [fetchStocks, fetchWatchlist]);

  // ── Live search with debounce ─────────────────────────
  const searchTimer = useRef(null);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim() || value.trim().length < 2) return;

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res       = await stockService.searchStocks(value.trim());
        const newStocks = res?.stocks ?? [];
        setAllStocks(prev => {
          const existingSymbols = new Set(prev.map(s => s.symbol));
          const toAdd           = newStocks.filter(s => !existingSymbols.has(s.symbol));
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
      } catch (_) {}
      finally { setSearching(false); }
    }, 500);
  }, []);

  // ── Socket live updates ───────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onPrice = ({ symbol, price, change, changePercent, volume }) => {
      setAllStocks(prev => prev.map(s =>
        s.symbol === symbol
          ? { ...s, currentPrice: price, priceChange: change, priceChangePct: changePercent, volume: volume ?? s.volume }
          : s
      ));
    };
    socket.on("price:update",  onPrice);
    socket.on("stock:halted",  ({ symbol }) => setAllStocks(prev => prev.map(s => s.symbol === symbol ? { ...s, isHalted: true  } : s)));
    socket.on("stock:resumed", ({ symbol }) => setAllStocks(prev => prev.map(s => s.symbol === symbol ? { ...s, isHalted: false } : s)));
    return () => { socket.off("price:update", onPrice); socket.off("stock:halted"); socket.off("stock:resumed"); };
  }, [socket]);

  // ── Watchlist toggle ──────────────────────────────────
  const toggleWatchlist = useCallback(async (symbol) => {
    const inList = watchlist.includes(symbol);
    setWatchlist(prev => inList ? prev.filter(s => s !== symbol) : [...prev, symbol]);
    try {
      if (inList) await watchlistService.removeFromWatchlist(symbol);
      else        await watchlistService.addToWatchlist(symbol);
    } catch (_) {
      setWatchlist(prev => inList ? [...prev, symbol] : prev.filter(s => s !== symbol));
    }
  }, [watchlist]);

  // ── Derived — filtered + sorted ───────────────────────
  const filteredStocks = allStocks
    .filter(s => {
      const q           = search.toLowerCase();
      const matchSearch = !q || s.symbol.toLowerCase().includes(q) || (s.companyName ?? s.name ?? "").toLowerCase().includes(q);
      const matchEx     = exchange === "All" || s.exchange === exchange;
      return matchSearch && matchEx;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":     return (b.currentPrice  ?? 0) - (a.currentPrice  ?? 0);
        case "change":    return (b.priceChangePct ?? b.changePercent ?? 0) - (a.priceChangePct ?? a.changePercent ?? 0);
        case "volume":    return (b.volume         ?? 0) - (a.volume         ?? 0);
        case "marketCap": return (b.marketCap      ?? 0) - (a.marketCap      ?? 0);
        default:          return (a.symbol ?? "").localeCompare(b.symbol ?? "");
      }
    });

  // ── Paginated slice ───────────────────────────────────
  const stocks     = filteredStocks.slice(0, page * PAGE_SIZE);
  const hasMore    = stocks.length < filteredStocks.length;
  const loadMore   = () => setPage(p => p + 1);
  const exchanges  = ["All", ...new Set(allStocks.map(s => s.exchange).filter(Boolean))];

  return (
    <MarketsContext.Provider value={{
      stocks,               // paginated
      allStocks,            // full list
      filteredStocks,       // filtered but not paginated (for count)
      watchlist,
      exchanges,
      loading,
      searching,
      error,
      lastUpdated,
      hasMore,
      loadMore,
      page,
      search,    setSearch: handleSearchChange,
      exchange,  setExchange,
      sortBy,    setSortBy,
      refresh:        fetchStocks,
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