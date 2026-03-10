import { useParams, useNavigate } from "react-router-dom";
import { TradeProvider, useTrade } from "../Context/TradeContext";
import StockHeader from "../Components/Main_trade/StockHeader.jsx";
import PriceChart  from "../Components/Main_trade/PriceChart.jsx";
import OHLCVBar    from "../Components/Main_trade/OHLCVBar.jsx";
import OrderPanel  from "../Components/Main_trade/Orderpanel.jsx";
import { StockDetails, OrderBook, YourPosition } from "../Components/Main_trade/StockInfo.jsx";

/* ============================================================
   INNER LAYOUT — consumes TradeContext
   ============================================================ */
const TradeLayout = () => {
  const navigate = useNavigate();
  const {
    stock, position, history,
    loading, error,
    cashBalance, maxBuy, sharesOwned,
    placeBuy, placeSell,
    tradeLoading, tradeResult, clearTradeResult,
  } = useTrade();

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#090e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #1a2540", borderTop: "3px solid #2d7ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: "14px", color: "#64748b" }}>Loading market data...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────
  if (error || !stock) {
    return (
      <div style={{ minHeight: "100vh", background: "#090e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px" }}>Stock not found</div>
          <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>{error ?? "This stock is not in our system"}</div>
          <button onClick={() => navigate("/market")} style={{ background: "#2d7ef7", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: "14px", fontWeight: "600", padding: "10px 24px", cursor: "pointer" }}>
            Browse Markets →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Stock header ────────────────────────────────── */}
        <StockHeader stock={stock} />

        {/* ── Main grid ───────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <PriceChart stock={stock} />
            <OHLCVBar   stock={stock} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <OrderPanel
              stock={stock}
              cashBalance={cashBalance}
              maxBuy={maxBuy}
              sharesOwned={sharesOwned}
              position={position}
              tradeLoading={tradeLoading}
              tradeResult={tradeResult}
              onBuy={placeBuy}
              onSell={placeSell}
              onClearResult={clearTradeResult}
            />
            <YourPosition stock={stock} position={position} />
          </div>
        </div>

        {/* ── Bottom grid ─────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <StockDetails stock={stock} />
          <OrderBook    stock={stock} />
        </div>

        {/* ── Trade History ───────────────────────────────── */}
        {history.length > 0 && (
          <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a2540", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Recent Trades
              </span>
            </div>
            {history.map((t, i) => {
              const isBuy  = (t.type ?? t.tradeType) === "BUY";
              const sym    = t.symbol ?? stock.symbol;
              const qty    = t.quantity ?? t.qty;
              const price  = t.price ?? t.executedPrice;
              const total  = t.total ?? t.totalAmount ?? (qty * price);
              return (
                <div key={t._id ?? i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: i < history.length - 1 ? "1px solid #1a2540" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: isBuy ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)", color: isBuy ? "#00e5a0" : "#ff4d6d", border: isBuy ? "1px solid rgba(0,229,160,0.25)" : "1px solid rgba(255,77,109,0.25)" }}>
                      {isBuy ? "BUY" : "SELL"}
                    </span>
                    <span style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "600" }}>
                      {qty} × {sym.replace(".NS", "")} @ ₹{Number(price).toLocaleString("en-IN")}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: isBuy ? "#ff4d6d" : "#00e5a0" }}>
                    {isBuy ? "-" : "+"}₹{Number(total).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

/* ============================================================
   TRADE PAGE — wraps layout with TradeProvider
   ============================================================ */
const TradePage = () => {
  const { symbol } = useParams();
  return (
    <TradeProvider symbol={symbol}>
      <TradeLayout />
    </TradeProvider>
  );
};

export default TradePage;