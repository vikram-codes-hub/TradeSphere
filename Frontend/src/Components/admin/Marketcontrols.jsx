import { useState } from "react";

const MOCK_STOCKS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 2941,  changePct: 1.62,  isHalted: false, haltReason: null          },
  { symbol: "TCS.NS",      name: "Tata Consultancy",    price: 3892,  changePct: 2.81,  isHalted: false, haltReason: null          },
  { symbol: "INFY.NS",     name: "Infosys",             price: 1842,  changePct: 1.22,  isHalted: false, haltReason: null          },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank",           price: 1623,  changePct: -0.39, isHalted: false, haltReason: null          },
  { symbol: "WIPRO.NS",    name: "Wipro",               price: 452,   changePct: -1.78, isHalted: false, haltReason: null          },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises",   price: 2340,  changePct: -3.10, isHalted: true,  haltReason: "High volatility (>10% move)" },
  { symbol: "TSLA",        name: "Tesla Inc.",           price: 18420, changePct: 4.20,  isHalted: false, haltReason: null          },
  { symbol: "AAPL",        name: "Apple Inc.",           price: 18100, changePct: 1.35,  isHalted: false, haltReason: null          },
];

const MarketControls = () => {
  const [stocks,    setStocks]    = useState(MOCK_STOCKS);
  const [haltModal, setHaltModal] = useState(null);
  const [haltReason,setHaltReason]= useState("");

  const toggleHalt = (symbol, reason = "Manual admin halt") => {
    setStocks(prev => prev.map(s =>
      s.symbol === symbol
        ? { ...s, isHalted: !s.isHalted, haltReason: !s.isHalted ? reason : null }
        : s
    ));
    setHaltModal(null);
    setHaltReason("");
  };

  const haltedCount = stocks.filter(s => s.isHalted).length;

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a2540", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🎛️</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Market Controls
          </span>
          {haltedCount > 0 && (
            <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", background: "rgba(255,77,109,0.12)", color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.25)" }}>
              {haltedCount} halted
            </span>
          )}
        </div>
        <div style={{ fontSize: "11px", color: "#64748b" }}>
          Circuit breaker auto-triggers at ±10% price move
        </div>
      </div>

      {/* Stock grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", padding: "20px" }}>
        {stocks.map((stock) => {
          const isUp = stock.changePct >= 0;
          const short = stock.symbol.replace(".NS", "");

          return (
            <div key={stock.symbol} style={{
              background:   stock.isHalted ? "rgba(255,77,109,0.04)" : "#131d30",
              border:       `1px solid ${stock.isHalted ? "rgba(255,77,109,0.25)" : "#1a2540"}`,
              borderRadius: "12px",
              padding:      "14px",
              transition:   "all 0.2s",
            }}>
              {/* Stock info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{short}</div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "1px" }}>{stock.name}</div>
                </div>
                {stock.isHalted && (
                  <span style={{ fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,77,109,0.12)", color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.25)" }}>
                    HALTED
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: "600", color: "#e2e8f0" }}>
                  ₹{stock.price.toLocaleString("en-IN")}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: isUp ? "#00e5a0" : "#ff4d6d", marginTop: "2px" }}>
                  {isUp ? "+" : ""}{stock.changePct}%
                </div>
              </div>

              {/* Halt reason */}
              {stock.isHalted && stock.haltReason && (
                <div style={{ fontSize: "10px", color: "#ff4d6d", marginBottom: "8px", padding: "4px 8px", background: "rgba(255,77,109,0.08)", borderRadius: "6px" }}>
                  {stock.haltReason}
                </div>
              )}

              {/* Halt/Resume button */}
              <button
                onClick={() => stock.isHalted ? toggleHalt(stock.symbol) : setHaltModal(stock)}
                style={{
                  width:        "100%",
                  background:   stock.isHalted ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
                  border:       `1px solid ${stock.isHalted ? "rgba(0,229,160,0.25)" : "rgba(255,77,109,0.25)"}`,
                  borderRadius: "8px",
                  color:        stock.isHalted ? "#00e5a0" : "#ff4d6d",
                  fontFamily:   "'Poppins', sans-serif",
                  fontSize:     "11px",
                  fontWeight:   "700",
                  padding:      "7px",
                  cursor:       "pointer",
                  transition:   "all 0.15s",
                }}
              >
                {stock.isHalted ? "▶ Resume Trading" : "⏸ Halt Trading"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Halt modal */}
      {haltModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
          onClick={() => setHaltModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0e1525", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "16px", padding: "28px", width: "380px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>⏸</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0", textAlign: "center", marginBottom: "6px" }}>
              Halt {haltModal.symbol.replace(".NS", "")}?
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center", marginBottom: "20px" }}>
              This will prevent all users from trading this stock
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                Halt Reason
              </label>
              <input
                value={haltReason}
                onChange={e => setHaltReason(e.target.value)}
                placeholder="e.g. High volatility, News event..."
                style={{ width: "100%", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "9px", color: "#e2e8f0", fontFamily: "'Poppins', sans-serif", fontSize: "13px", padding: "10px 12px", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setHaltModal(null)} style={{ flex: 1, background: "transparent", border: "1px solid #1a2540", borderRadius: "10px", color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: "600", padding: "10px", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => toggleHalt(haltModal.symbol, haltReason || "Manual admin halt")} style={{ flex: 1, background: "rgba(255,77,109,0.15)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "10px", color: "#ff4d6d", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: "700", padding: "10px", cursor: "pointer" }}>
                Confirm Halt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketControls;