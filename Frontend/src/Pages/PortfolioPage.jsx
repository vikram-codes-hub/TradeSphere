import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioStats    from "../Components/portfolio/Portfoliostats.jsx"
import HoldingsTable     from "../Components/portfolio/HoldingsTable.jsx";
import AllocationChart   from "../Components/portfolio/AllocationChart.jsx";
import PnLChart          from "../Components/portfolio/PnLChart.jsx";
import TransactionHistory from "../Components/portfolio/TransactionHistory.jsx";

/* ── Mock data — replace with API ───────────────────────── */
const MOCK_HOLDINGS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy",     quantity: 10, avgBuyPrice: 2800,  currentPrice: 2941  },
  { symbol: "TCS.NS",      name: "Tata Consultancy",    sector: "Technology", quantity: 5,  avgBuyPrice: 3750,  currentPrice: 3892  },
  { symbol: "AAPL",        name: "Apple Inc.",           sector: "Technology", quantity: 3,  avgBuyPrice: 17200, currentPrice: 18100 },
  { symbol: "TSLA",        name: "Tesla Inc.",           sector: "Automobile", quantity: 2,  avgBuyPrice: 17500, currentPrice: 18420 },
  { symbol: "INFY.NS",     name: "Infosys",              sector: "Technology", quantity: 8,  avgBuyPrice: 1780,  currentPrice: 1842  },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank",            sector: "Banking",    quantity: 4,  avgBuyPrice: 1650,  currentPrice: 1623  },
].map(h => {
  const currentValue = h.currentPrice * h.quantity;
  const invested     = h.avgBuyPrice  * h.quantity;
  const pnl          = currentValue - invested;
  const pnlPct       = parseFloat(((pnl / invested) * 100).toFixed(2));
  return { ...h, currentValue, invested, pnl, pnlPct };
});

const CASH_BALANCE = 44370;

/* ── Derived stats ───────────────────────────────────────── */
const calcStats = (holdings) => {
  const totalInvested  = holdings.reduce((s, h) => s + h.invested,      0);
  const currentValue   = holdings.reduce((s, h) => s + h.currentValue,  0);
  const unrealisedPnL  = currentValue - totalInvested;
  const unrealisedPct  = parseFloat(((unrealisedPnL / totalInvested) * 100).toFixed(2));
  return {
    totalInvested:  Math.round(totalInvested),
    currentValue:   Math.round(currentValue),
    unrealisedPnL:  Math.round(unrealisedPnL),
    unrealisedPct,
    realisedPnL:    8200,   // from closed trades
    totalTrades:    48,
    winRate:        62,
    holdingsCount:  holdings.length,
  };
};

/* ============================================================
   PORTFOLIO PAGE
   ============================================================ */
const PortfolioPage = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);
  const [sellModal, setSellModal] = useState(null);  // holding to sell
  const [sellQty,   setSellQty]   = useState(1);
  const [selling,   setSelling]   = useState(false);
  const [sellDone,  setSellDone]  = useState(false);

  const stats       = calcStats(holdings);
  const totalValue  = stats.currentValue + CASH_BALANCE;

  const handleSell = (holding) => {
    setSellModal(holding);
    setSellQty(1);
    setSellDone(false);
  };

  const confirmSell = () => {
    setSelling(true);
    setTimeout(() => {
      setHoldings(prev => {
        return prev
          .map(h => h.symbol === sellModal.symbol
            ? { ...h, quantity: h.quantity - sellQty, currentValue: (h.quantity - sellQty) * h.currentPrice, pnl: (h.currentPrice - h.avgBuyPrice) * (h.quantity - sellQty) }
            : h
          )
          .filter(h => h.quantity > 0);
      });
      setSelling(false);
      setSellDone(true);
      setTimeout(() => setSellModal(null), 1500);
    }, 1200);
  };

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Page header ──────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>
              Portfolio
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Your holdings, P&L and transaction history
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Total value */}
            <div style={{
              background: "#0e1525", border: "1px solid #1a2540",
              borderRadius: "12px", padding: "10px 18px", textAlign: "right",
            }}>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total Account Value
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "20px", fontWeight: "700", color: "#e2e8f0", marginTop: "2px" }}>
                ₹{totalValue.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Cash balance */}
            <div style={{
              background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.2)",
              borderRadius: "12px", padding: "10px 18px", textAlign: "right",
            }}>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Cash Balance
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "20px", fontWeight: "700", color: "#00e5a0", marginTop: "2px" }}>
                ₹{CASH_BALANCE.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────── */}
        <PortfolioStats stats={stats} />

        {/* ── Holdings table ───────────────────────────────── */}
        <HoldingsTable holdings={holdings} onSell={handleSell} />

        {/* ── Charts row ───────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", marginBottom: "20px" }}>
          <PnLChart />
          <AllocationChart holdings={holdings} />
        </div>

        {/* ── Transaction history ──────────────────────────── */}
        <TransactionHistory />

      </div>

      {/* ── Sell Modal ───────────────────────────────────── */}
      {sellModal && (
        <div style={{
          position:       "fixed",
          inset:          0,
          background:     "rgba(0,0,0,0.7)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         1000,
          backdropFilter: "blur(4px)",
        }}
          onClick={() => !selling && setSellModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   "#0e1525",
              border:       "1px solid #1a2540",
              borderRadius: "20px",
              padding:      "32px",
              width:        "400px",
              boxShadow:    "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            {sellDone ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0" }}>Sell Order Placed!</div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "8px" }}>
                  Sold {sellQty} shares of {sellModal.symbol.replace(".NS", "")}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0", margin: 0 }}>
                    Sell {sellModal.symbol.replace(".NS", "")}
                  </h3>
                  <button onClick={() => setSellModal(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: "18px", cursor: "pointer" }}>✕</button>
                </div>

                {/* Stock info */}
                <div style={{ background: "#131d30", border: "1px solid #1a2540", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Current Price</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: "600", color: "#e2e8f0" }}>
                      ₹{sellModal.currentPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Avg Buy Price</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>
                      ₹{sellModal.avgBuyPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>You Own</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: "600", color: "#e2e8f0" }}>
                      {sellModal.quantity} shares
                    </span>
                  </div>
                </div>

                {/* Qty selector */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                    Quantity to Sell
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => setSellQty(q => Math.max(q - 1, 1))}
                      style={{ width: "36px", height: "36px", background: "#131d30", border: "1px solid #1a2540", borderRadius: "8px", color: "#e2e8f0", fontSize: "18px", cursor: "pointer" }}
                    >−</button>
                    <input
                      type="number"
                      min={1}
                      max={sellModal.quantity}
                      value={sellQty}
                      onChange={e => setSellQty(Math.min(Math.max(parseInt(e.target.value) || 1, 1), sellModal.quantity))}
                      style={{ flex: 1, background: "#090e1a", border: "1px solid #1a2540", borderRadius: "8px", color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: "600", padding: "8px 12px", outline: "none", textAlign: "center" }}
                    />
                    <button
                      onClick={() => setSellQty(q => Math.min(q + 1, sellModal.quantity))}
                      style={{ width: "36px", height: "36px", background: "#131d30", border: "1px solid #1a2540", borderRadius: "8px", color: "#e2e8f0", fontSize: "18px", cursor: "pointer" }}
                    >+</button>
                    <button
                      onClick={() => setSellQty(sellModal.quantity)}
                      style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "8px", color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "11px", padding: "8px 10px", cursor: "pointer" }}
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.15)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>You will receive</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: "700", color: "#00e5a0", fontSize: "15px" }}>
                      +₹{(sellQty * sellModal.currentPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Estimated P&L</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: "600", fontSize: "13px", color: (sellModal.currentPrice - sellModal.avgBuyPrice) >= 0 ? "#00e5a0" : "#ff4d6d" }}>
                      {(sellModal.currentPrice - sellModal.avgBuyPrice) >= 0 ? "+" : ""}
                      ₹{Math.abs((sellModal.currentPrice - sellModal.avgBuyPrice) * sellQty).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  onClick={confirmSell}
                  disabled={selling}
                  style={{
                    width:        "100%",
                    background:   selling ? "#1a2540" : "rgba(255,77,109,0.15)",
                    border:       "1px solid rgba(255,77,109,0.3)",
                    borderRadius: "12px",
                    color:        "#ff4d6d",
                    fontFamily:   "'Poppins', sans-serif",
                    fontSize:     "15px",
                    fontWeight:   "700",
                    padding:      "14px",
                    cursor:       selling ? "not-allowed" : "pointer",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    gap:          "8px",
                    transition:   "all 0.2s",
                  }}
                >
                  {selling ? (
                    <>
                      <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,77,109,0.3)", borderTop: "2px solid #ff4d6d", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                      Placing Order...
                    </>
                  ) : (
                    `Confirm Sell · ${sellQty} shares`
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PortfolioPage;