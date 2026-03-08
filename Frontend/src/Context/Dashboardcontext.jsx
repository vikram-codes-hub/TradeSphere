import { createContext, useContext, useState, useEffect, useCallback } from "react";
import portfolioService   from "../services/portfolioService";
import { stockService }   from "../services/stockService";
import { tradeService }   from "../services/tradeService";
import { watchlistService } from "../services/watchlistService";
import { useAuth }        from "./AuthContext";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();

  const [summary,     setSummary]     = useState(null);
  const [holdings,    setHoldings]    = useState([]);
  const [trades,      setTrades]      = useState([]);
  const [topMovers,   setTopMovers]   = useState([]);
  const [watchlist,   setWatchlist]   = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, portfolioRes, tradesRes, topMoversRes, watchlistRes] =
        await Promise.allSettled([
          portfolioService.getSummary(),
          portfolioService.getPortfolio(),
          tradeService.getHistory({ limit: 5 }),
          stockService.getAllStocks(),
          watchlistService.getWatchlist(),
        ]);

      // ── Summary ───────────────────────────────────────
      if (summaryRes.status === "fulfilled") {
        const s         = summaryRes.value?.summary ?? {};
        const deposited = user.totalDeposited ?? 100000;
        const netWorth  = s.netWorth ?? user.cashBalance ?? 100000;

        setSummary({
          netWorth,
          cashBalance:       s.cashBalance        ?? user.cashBalance ?? 100000,
          totalCurrentValue: s.totalCurrentValue  ?? 0,
          investedValue:     s.totalInvestedValue ?? 0,
          unrealisedPnl:     s.unrealisedPnl      ?? 0,
          unrealisedPct:     s.unrealisedPct      ?? 0,
          totalHoldings:     s.holdingsCount      ?? 0,
          totalDeposited:    deposited,
          totalTrades:       user.totalTrades      ?? 0,
          winRate:           user.winningTrades && user.totalTrades
                               ? parseFloat(((user.winningTrades / user.totalTrades) * 100).toFixed(2))
                               : 0,
          totalPnl:          user.totalPnl         ?? 0,
          totalPnlPct:       deposited > 0
                               ? parseFloat(((netWorth - deposited) / deposited * 100).toFixed(2))
                               : 0,
          todayPnl:          0,
          todayPnlPct:       0,
        });
      } else {
        setError("Failed to load dashboard data.");
        setSummary({
          netWorth:       user.cashBalance    ?? 100000,
          cashBalance:    user.cashBalance    ?? 100000,
          totalHoldings:  0,
          totalTrades:    user.totalTrades    ?? 0,
          winRate:        0,
          totalPnl:       user.totalPnl       ?? 0,
          totalDeposited: user.totalDeposited ?? 100000,
          totalPnlPct:    0,
          todayPnl:       0,
          todayPnlPct:    0,
          investedValue:  0,
          unrealisedPnl:  0,
        });
      }

      // ── Holdings ──────────────────────────────────────
      if (portfolioRes.status === "fulfilled") {
        setHoldings(portfolioRes.value?.holdings ?? []);
      }

      // ── Recent trades ─────────────────────────────────
      if (tradesRes.status === "fulfilled") {
        setTrades(tradesRes.value?.trades ?? []);
      }

      // ── Top movers — sort by absolute % change ────────
      if (topMoversRes.status === "fulfilled") {
        const stocks = topMoversRes.value?.stocks ?? [];
        setTopMovers(
          [...stocks].sort((a, b) =>
            Math.abs(b.changePercent) - Math.abs(a.changePercent)
          )
        );
      }

      // ── Watchlist ─────────────────────────────────────
      if (watchlistRes.status === "fulfilled") {
        setWatchlist(watchlistRes.value?.watchlist ?? []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const refreshSummary = useCallback(async () => {
    try {
      const res = await portfolioService.getSummary();
      const s   = res?.summary ?? {};
      setSummary(prev => prev ? {
        ...prev,
        netWorth:          s.netWorth           ?? prev.netWorth,
        cashBalance:       s.cashBalance        ?? prev.cashBalance,
        totalCurrentValue: s.totalCurrentValue  ?? prev.totalCurrentValue,
        investedValue:     s.totalInvestedValue ?? prev.investedValue,
        unrealisedPnl:     s.unrealisedPnl      ?? prev.unrealisedPnl,
        totalHoldings:     s.holdingsCount      ?? prev.totalHoldings,
      } : prev);
    } catch (_) {}
  }, []);

  const refreshTrades = useCallback(async () => {
    try {
      const res = await tradeService.getHistory({ limit: 5 });
      setTrades(res?.trades ?? []);
    } catch (_) {}
  }, []);

  return (
    <DashboardContext.Provider value={{
      summary,
      holdings,
      trades,
      topMovers,
      watchlist,
      predictions,
      loading,
      error,
      lastUpdated,
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