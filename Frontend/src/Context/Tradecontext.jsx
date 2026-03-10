import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { stockService }     from "../services/stockService";
import { tradeService }     from "../services/tradeService";
import portfolioService     from "../services/portfolioService";
import { useSocket }        from "../hooks/useSocket";
import { useAuth }          from "./AuthContext";

const TradeContext = createContext(null);

export const TradeProvider = ({ symbol, children }) => {
  const socket   = useSocket();
  const { user } = useAuth();

  const [stock,       setStock]       = useState(null);
  const [position,    setPosition]    = useState(null); // user's holding in this stock
  const [portfolio,   setPortfolio]   = useState(null); // summary (for cash balance)
  const [history,     setHistory]     = useState([]);   // recent trades for this stock
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [tradeLoading,setTradeLoading]= useState(false);
  const [tradeResult, setTradeResult] = useState(null); // { success, type, qty, price, total }

  // ── Fetch stock data ──────────────────────────────────
  const fetchStock = useCallback(async () => {
    try {
      const res = await stockService.getStock(symbol);
      setStock(res?.stock ?? null);
    } catch (err) {
      setError("Stock not found");
    }
  }, [symbol]);

  // ── Fetch user portfolio (cash balance + positions) ───
  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await portfolioService.getPortfolioSummary();
      setPortfolio(res?.summary ?? res ?? null);

      // Find this stock's position
      const holdingsRes = await portfolioService.getPortfolio();
      const holdings    = holdingsRes?.portfolio?.holdings ?? holdingsRes?.holdings ?? [];
      const found       = holdings.find(h => h.symbol === symbol || h.stock?.symbol === symbol);
      setPosition(found ?? null);
    } catch (_) {}
  }, [symbol]);

  // ── Fetch recent trades for this stock ────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await tradeService.getHistory({ symbol, limit: 10 });
      setHistory(res?.trades ?? []);
    } catch (_) {}
  }, [symbol]);

  // ── Load everything on mount ──────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchStock(), fetchPortfolio(), fetchHistory()]);
      setLoading(false);
    };
    load();
  }, [fetchStock, fetchPortfolio, fetchHistory]);

  // ── Socket — live price updates ───────────────────────
  useEffect(() => {
    if (!socket || !symbol) return;

    // Join this stock's room
    socket.emit("subscribe:stock", symbol);

    const onPrice = ({ symbol: sym, price, change, changePercent, volume }) => {
      if (sym !== symbol) return;
      setStock(prev => prev ? {
        ...prev,
        currentPrice:   price,
        priceChange:    change,
        priceChangePct: changePercent,
        volume:         volume ?? prev.volume,
      } : prev);
    };

    const onHalt    = ({ symbol: sym }) => { if (sym === symbol) setStock(prev => prev ? { ...prev, isHalted: true  } : prev); };
    const onResume  = ({ symbol: sym }) => { if (sym === symbol) setStock(prev => prev ? { ...prev, isHalted: false } : prev); };

    socket.on("price:update",  onPrice);
    socket.on("stock:halted",  onHalt);
    socket.on("stock:resumed", onResume);

    return () => {
      socket.emit("unsubscribe:stock", symbol);
      socket.off("price:update",  onPrice);
      socket.off("stock:halted",  onHalt);
      socket.off("stock:resumed", onResume);
    };
  }, [socket, symbol]);

  // ── Place BUY order ───────────────────────────────────
  const placeBuy = useCallback(async (quantity) => {
    if (!stock) return;
    setTradeLoading(true);
    setTradeResult(null);
    try {
      const res = await tradeService.buy(symbol, quantity);
      const price = stock.currentPrice;
      setTradeResult({
        success: true,
        type:    "BUY",
        qty:     quantity,
        price,
        total:   parseFloat((quantity * price).toFixed(2)),
        trade:   res?.trade,
      });
      // Refresh portfolio + history after trade
      await Promise.all([fetchPortfolio(), fetchHistory()]);
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Trade failed";
      setTradeResult({ success: false, error: msg });
      return { success: false, error: msg };
    } finally {
      setTradeLoading(false);
    }
  }, [stock, symbol, fetchPortfolio, fetchHistory]);

  // ── Place SELL order ──────────────────────────────────
  const placeSell = useCallback(async (quantity) => {
    if (!stock) return;
    setTradeLoading(true);
    setTradeResult(null);
    try {
      const res = await tradeService.sell(symbol, quantity);
      const price = stock.currentPrice;
      setTradeResult({
        success: true,
        type:    "SELL",
        qty:     quantity,
        price,
        total:   parseFloat((quantity * price).toFixed(2)),
        trade:   res?.trade,
      });
      await Promise.all([fetchPortfolio(), fetchHistory()]);
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Trade failed";
      setTradeResult({ success: false, error: msg });
      return { success: false, error: msg };
    } finally {
      setTradeLoading(false);
    }
  }, [stock, symbol, fetchPortfolio, fetchHistory]);

  const clearTradeResult = useCallback(() => setTradeResult(null), []);

  // ── Derived values ────────────────────────────────────
  const cashBalance  = portfolio?.cashBalance ?? portfolio?.balance ?? 0;
  const price        = stock?.currentPrice ?? 0;
  const maxBuy       = price > 0 ? Math.floor(cashBalance / price) : 0;
  const sharesOwned  = position?.quantity ?? position?.shares ?? 0;

  return (
    <TradeContext.Provider value={{
      stock,
      position,
      portfolio,
      history,
      loading,
      error,
      tradeLoading,
      tradeResult,
      cashBalance,
      maxBuy,
      sharesOwned,
      placeBuy,
      placeSell,
      clearTradeResult,
      refresh: () => Promise.all([fetchStock(), fetchPortfolio(), fetchHistory()]),
    }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error("useTrade must be used inside TradeProvider");
  return ctx;
};