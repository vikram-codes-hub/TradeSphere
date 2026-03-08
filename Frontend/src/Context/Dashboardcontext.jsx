import { createContext, useContext, useState, useEffect, useCallback } from "react";
import portfolioService from "../Services/portfolioService"
import {stockService} from "../Services/stockService"
import {tradeService}     from "../services/tradeService";
import {watchlistService} from "../services/watchlistService";
import { useAuth }      from "./AuthContext";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();

  // ── State ─────────────────────────────────────────────
  const [summary,   setSummary]   = useState(null);   // portfolio summary
  const [holdings,  setHoldings]  = useState([]);     // current holdings
  const [trades,    setTrades]    = useState([]);     // recent trades
  const [topMovers, setTopMovers] = useState([]);     // top gaining/losing stocks
  const [watchlist, setWatchlist] = useState([]);     // watchlist items
  const [predictions, setPredictions] = useState([]); // recent predictions

  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── Fetch all dashboard data in parallel ──────────────
  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, holdingsRes, tradesRes, topMoversRes, watchlistRes] =
        await Promise.allSettled([
          portfolioService.getSummary(),
          portfolioService.getPortfolio(),
          tradeService.getMyTrades({ limit: 5 }),
          stockService.getTopMovers(),
          watchlistService.getWatchlist(),
        ]);

      if (summaryRes.status   === "fulfilled") setSummary(summaryRes.value?.data?.summary       ?? null);
      if (holdingsRes.status  === "fulfilled") setHoldings(holdingsRes.value?.data?.holdings    ?? []);
      if (tradesRes.status    === "fulfilled") setTrades(tradesRes.value?.data?.trades           ?? []);
      if (topMoversRes.status === "fulfilled") setTopMovers(topMoversRes.value?.data?.stocks     ?? []);
      if (watchlistRes.status === "fulfilled") setWatchlist(watchlistRes.value?.data?.watchlist  ?? []);

      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Initial load ──────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Auto-refresh every 60 seconds ─────────────────────
  useEffect(() => {
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Refresh just summary (after a trade) ──────────────
  const refreshSummary = useCallback(async () => {
    try {
      const res = await portfolioService.getSummary();
      setSummary(res?.data?.summary ?? null);
    } catch (_) {}
  }, []);

  // ── Refresh just trades (after a trade) ───────────────
  const refreshTrades = useCallback(async () => {
    try {
      const res = await tradeService.getMyTrades({ limit: 5 });
      setTrades(res?.data?.trades ?? []);
    } catch (_) {}
  }, []);

  return (
    <DashboardContext.Provider value={{
      // data
      summary,
      holdings,
      trades,
      topMovers,
      watchlist,
      predictions,

      // state
      loading,
      error,
      lastUpdated,

      // actions
      refresh:        fetchAll,
      refreshSummary,
      refreshTrades,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
};