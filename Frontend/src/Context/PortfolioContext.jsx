import { createContext, useContext, useState, useEffect, useCallback } from "react";
import portfolioService  from "../services/portfolioService";
import { tradeService }  from "../services/tradeService";

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [holdings,     setHoldings]     = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [sellLoading,  setSellLoading]  = useState(false);
  const [sellResult,   setSellResult]   = useState(null);

  // ── Fetch holdings ────────────────────────────────────
  const fetchHoldings = useCallback(async () => {
    try {
      const res      = await portfolioService.getPortfolio();
      // Normalise: could be { portfolio: [...] } or { holdings: [...] } or array
      const raw      = Array.isArray(res?.portfolio) ? res.portfolio
                     : Array.isArray(res?.holdings)  ? res.holdings
                     : Array.isArray(res)             ? res
                     : [];

      // Enrich each holding with derived values
      const enriched = raw.map(h => {
        const qty       = h.quantity   ?? h.shares ?? 0;
        const avgPrice  = h.avgBuyPrice ?? h.averageBuyPrice ?? h.avgPrice ?? 0;
        const curPrice  = h.currentPrice ?? h.stock?.currentPrice ?? avgPrice;
        const name      = h.companyName  ?? h.stock?.companyName  ?? h.name ?? h.symbol;
        const sector    = h.sector       ?? h.stock?.sector        ?? "Other";
        const curValue  = parseFloat((qty * curPrice).toFixed(2));
        const invested  = parseFloat((qty * avgPrice).toFixed(2));
        const pnl       = parseFloat((curValue - invested).toFixed(2));
        const pnlPct    = invested > 0 ? parseFloat(((pnl / invested) * 100).toFixed(2)) : 0;
        return {
          ...h,
          quantity:     qty,
          avgBuyPrice:  avgPrice,
          currentPrice: curPrice,
          companyName:  name,
          sector,
          currentValue: curValue,
          invested,
          pnl,
          pnlPct,
        };
      });
      setHoldings(enriched);
    } catch (err) {
      setError("Failed to load holdings");
    }
  }, []);

  // ── Fetch summary ─────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const res = await portfolioService.getSummary();
      setSummary(res?.summary ?? null);
    } catch (_) {}
  }, []);

  // ── Fetch transaction history ─────────────────────────
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await tradeService.getHistory({ limit: 50 });
      const raw = res?.trades ?? [];
      // Normalise trade fields
      const normalised = raw.map(t => ({
        ...t,
        id:     t._id,
        type:   t.type ?? t.tradeType ?? "BUY",
        symbol: t.symbol ?? t.stockSymbol,
        qty:    t.quantity ?? t.qty,
        price:  t.price ?? t.executedPrice ?? t.priceAtTrade,
        total:  t.total ?? t.totalAmount ?? ((t.quantity ?? 0) * (t.price ?? 0)),
        pnl:    t.pnl ?? t.profitLoss ?? null,
        time:   t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN", {
          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
        }) : "",
      }));
      setTransactions(normalised);
    } catch (_) {}
  }, []);

  // ── Load all ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchHoldings(), fetchSummary(), fetchTransactions()]);
      setLoading(false);
    };
    load();
  }, [fetchHoldings, fetchSummary, fetchTransactions]);

  // ── Sell from portfolio page ──────────────────────────
  const sellHolding = useCallback(async (symbol, quantity) => {
    setSellLoading(true);
    setSellResult(null);
    try {
      await tradeService.sell(symbol, quantity);
      setSellResult({ success: true, symbol, quantity });
      await Promise.all([fetchHoldings(), fetchSummary(), fetchTransactions()]);
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Sell failed";
      setSellResult({ success: false, error: msg });
      return { success: false, error: msg };
    } finally {
      setSellLoading(false);
    }
  }, [fetchHoldings, fetchSummary, fetchTransactions]);

  const clearSellResult = useCallback(() => setSellResult(null), []);

  // ── Derived stats ─────────────────────────────────────
  const stats = {
    totalInvested:  holdings.reduce((s, h) => s + h.invested,      0),
    currentValue:   holdings.reduce((s, h) => s + h.currentValue,  0),
    unrealisedPnL:  holdings.reduce((s, h) => s + h.pnl,           0),
    unrealisedPct:  (() => {
      const inv = holdings.reduce((s, h) => s + h.invested, 0);
      const cur = holdings.reduce((s, h) => s + h.currentValue, 0);
      return inv > 0 ? parseFloat(((cur - inv) / inv * 100).toFixed(2)) : 0;
    })(),
    realisedPnL:    summary?.totalPnl       ?? 0,
    totalTrades:    summary?.totalTrades    ?? 0,
    winRate:        summary?.winRate        ?? 0,
    holdingsCount:  holdings.length,
    cashBalance:    summary?.cashBalance    ?? 0,
    netWorth:       summary?.netWorth       ?? 0,
    winningTrades:  summary?.winningTrades  ?? 0,
  };

  return (
    <PortfolioContext.Provider value={{
      holdings, summary, transactions, stats,
      loading, error,
      sellLoading, sellResult,
      sellHolding, clearSellResult,
      refresh: () => Promise.all([fetchHoldings(), fetchSummary(), fetchTransactions()]),
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be inside PortfolioProvider");
  return ctx;
};