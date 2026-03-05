import { useNavigate } from "react-router-dom";

const MOCK_HOLDINGS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", qty: 10, avgPrice: 2800,  currentPrice: 2941  },
  { symbol: "TCS.NS",      name: "Tata Consultancy",    qty: 5,  avgPrice: 3750,  currentPrice: 3892  },
  { symbol: "AAPL",        name: "Apple Inc.",           qty: 3,  avgPrice: 17200, currentPrice: 18100 },
  { symbol: "TSLA",        name: "Tesla Inc.",           qty: 2,  avgPrice: 17500, currentPrice: 18420 },
];

const th = {
  fontSize:      "10px",
  fontWeight:    "600",
  color:         "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding:       "0 0 10px 0",
};

const HoldingsPreview = ({ holdings = MOCK_HOLDINGS }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      padding:      "24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>💼</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Your Holdings
          </span>
        </div>
        <button
          onClick={() => navigate("/portfolio")}
          style={{ background: "none", border: "none", color: "#2d7ef7", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
        >
          View All →
        </button>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr", gap: "12px", padding: "0 12px", borderBottom: "1px solid #1a2540", paddingBottom: "10px", marginBottom: "4px" }}>
        {["Stock", "Qty / Avg Buy", "Current Price", "P&L"].map((h) => (
          <span key={h} style={th}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {holdings.map((h) => {
        const pnl    = (h.currentPrice - h.avgPrice) * h.qty;
        const pnlPct = (((h.currentPrice - h.avgPrice) / h.avgPrice) * 100).toFixed(2);
        const isUp   = pnl >= 0;
        const short  = h.symbol.replace(".NS", "");

        return (
          <div
            key={h.symbol}
            onClick={() => navigate(`/trade/${h.symbol}`)}
            style={{
              display:       "grid",
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr",
              gap:           "12px",
              alignItems:    "center",
              padding:       "12px",
              borderRadius:  "12px",
              cursor:        "pointer",
              transition:    "background 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px",
                background: "#131d30", border: "1px solid #1a2540",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: "700", color: "#2d7ef7", flexShrink: 0,
              }}>
                {short.slice(0, 3)}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{h.name}</div>
              </div>
            </div>

            {/* Qty / Avg */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#e2e8f0", fontWeight: "600" }}>
                {h.qty} shares
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                avg ₹{h.avgPrice.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Current */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
              ₹{h.currentPrice.toLocaleString("en-IN")}
            </div>

            {/* P&L */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
                {isUp ? "+" : "-"}₹{Math.abs(pnl).toLocaleString("en-IN")}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "600", color: isUp ? "#00e5a0" : "#ff4d6d", marginTop: "2px" }}>
                {isUp ? "+" : ""}{pnlPct}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HoldingsPreview;