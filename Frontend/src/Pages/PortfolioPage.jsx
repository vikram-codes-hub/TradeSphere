import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortfolioProvider, usePortfolio } from "../Context/PortfolioContext";
import PortfolioStats     from "../Components/portfolio/Portfoliostats.jsx";
import HoldingsTable      from "../Components/portfolio/HoldingsTable.jsx";
import AllocationChart    from "../Components/portfolio/AllocationChart.jsx";
import PnLChart           from "../Components/portfolio/PnLChart.jsx";
import TransactionHistory from "../Components/portfolio/TransactionHistory.jsx";

/* ============================================================
   SELL MODAL
   ============================================================ */
const SellModal = ({ holding, onClose }) => {
  const { sellHolding, sellLoading, sellResult, clearSellResult } = usePortfolio();
  const [qty, setQty] = useState(1);

  const maxQty  = holding.quantity;
  const price   = holding.currentPrice;
  const receive = parseFloat((qty * price).toFixed(2));
  const estPnL  = parseFloat(((price - holding.avgBuyPrice) * qty).toFixed(2));
  const isUp    = estPnL >= 0;
  const success = sellResult?.success;

  const handleClose = () => { clearSellResult(); onClose(); };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
      onClick={() => !sellLoading && handleClose()}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "20px", padding: "32px", width: "400px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0" }}>Sell Order Placed!</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "8px" }}>Sold {qty} shares of {holding.symbol.replace(".NS", "")}</div>
            <button onClick={handleClose} style={{ marginTop: "20px", background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.25)", borderRadius: "10px", color: "#00e5a0", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: "600", padding: "10px 24px", cursor: "pointer" }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0", margin: 0 }}>Sell {holding.symbol.replace(".NS", "")}</h3>
              <button onClick={handleClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ background: "#131d30", border: "1px solid #1a2540", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              {[
                { label: "Current Price", value: `₹${price.toLocaleString("en-IN")}`,               color: "#e2e8f0" },
                { label: "Avg Buy Price", value: `₹${holding.avgBuyPrice.toLocaleString("en-IN")}`, color: "#94a3b8" },
                { label: "You Own",       value: `${maxQty} shares`,                                color: "#e2e8f0" },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < arr.length - 1 ? "8px" : 0 }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{row.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: "600", color: row.color, fontSize: "13px" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Quantity to Sell</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => setQty(q => Math.max(q - 1, 1))} style={{ width: "36px", height: "36px", background: "#131d30", border: "1px solid #1a2540", borderRadius: "8px", color: "#e2e8f0", fontSize: "18px", cursor: "pointer" }}>−</button>
                <input type="number" min={1} max={maxQty} value={qty} onChange={e => setQty(Math.min(Math.max(parseInt(e.target.value) || 1, 1), maxQty))}
                  style={{ flex: 1, background: "#090e1a", border: "1px solid #1a2540", borderRadius: "8px", color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: "600", padding: "8px 12px", outline: "none", textAlign: "center" }} />
                <button onClick={() => setQty(q => Math.min(q + 1, maxQty))} style={{ width: "36px", height: "36px", background: "#131d30", border: "1px solid #1a2540", borderRadius: "8px", color: "#e2e8f0", fontSize: "18px", cursor: "pointer" }}>+</button>
                <button onClick={() => setQty(maxQty)} style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "8px", color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "11px", padding: "8px 10px", cursor: "pointer" }}>MAX</button>
              </div>
            </div>

            <div style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.15)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>You will receive</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: "700", color: "#00e5a0", fontSize: "15px" }}>+₹{receive.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Estimated P&L</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: "600", fontSize: "13px", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
                  {isUp ? "+" : ""}₹{Math.abs(estPnL).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {sellResult?.error && (
              <div style={{ fontSize: "12px", color: "#ff4d6d", marginBottom: "12px", padding: "8px 12px", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "8px" }}>⚠️ {sellResult.error}</div>
            )}

            <button onClick={() => sellHolding(holding.symbol, qty)} disabled={sellLoading}
              style={{ width: "100%", background: sellLoading ? "#1a2540" : "rgba(255,77,109,0.15)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "12px", color: "#ff4d6d", fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: "700", padding: "14px", cursor: sellLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {sellLoading
                ? <><span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,77,109,0.3)", borderTop: "2px solid #ff4d6d", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Placing Order...</>
                : `Confirm Sell · ${qty} shares`}
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ============================================================
   INNER LAYOUT
   ============================================================ */
const PortfolioLayout = () => {
  const { holdings, stats, transactions, loading } = usePortfolio();
  const [sellModal, setSellModal] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#090e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #1a2540", borderTop: "3px solid #2d7ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: "14px", color: "#64748b" }}>Loading portfolio...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalValue = stats.currentValue + stats.cashBalance;

  return (
    <div style={{ minHeight: "100vh", background: "#090e1a", fontFamily: "'Poppins', sans-serif", backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>Portfolio</h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Your holdings, P&L and transaction history</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "12px", padding: "10px 18px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Account Value</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "20px", fontWeight: "700", color: "#e2e8f0", marginTop: "2px" }}>₹{totalValue.toLocaleString("en-IN")}</div>
            </div>
            <div style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "12px", padding: "10px 18px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cash Balance</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "20px", fontWeight: "700", color: "#00e5a0", marginTop: "2px" }}>₹{stats.cashBalance.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>

        <PortfolioStats stats={stats} />
        <HoldingsTable  holdings={holdings} onSell={h => setSellModal(h)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", marginBottom: "20px" }}>
          <PnLChart />
          <AllocationChart holdings={holdings} />
        </div>

        <TransactionHistory transactions={transactions} />
      </div>

      {sellModal && <SellModal holding={sellModal} onClose={() => setSellModal(null)} />}
    </div>
  );
};

/* ============================================================
   PORTFOLIO PAGE
   ============================================================ */
const PortfolioPage = () => (
  <PortfolioProvider>
    <PortfolioLayout />
  </PortfolioProvider>
);

export default PortfolioPage;