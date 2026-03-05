const MOCK_HISTORY = [
  { id: 1, symbol: "TSLA",         name: "Tesla",            trend: "bullish", confidence: 82, currentPrice: 18420, predictedPrice: 19200, pctChange: 4.23,  time: "2 mins ago"  },
  { id: 2, symbol: "TCS.NS",       name: "Tata Consultancy", trend: "bullish", confidence: 74, currentPrice: 3892,  predictedPrice: 4050,  pctChange: 4.06,  time: "1 hr ago"    },
  { id: 3, symbol: "AAPL",         name: "Apple Inc.",       trend: "bullish", confidence: 68, currentPrice: 18100, predictedPrice: 18800, pctChange: 3.87,  time: "3 hrs ago"   },
  { id: 4, symbol: "WIPRO.NS",     name: "Wipro",            trend: "bearish", confidence: 71, currentPrice: 452,   predictedPrice: 441,   pctChange: -2.43, time: "Yesterday"   },
  { id: 5, symbol: "HDFCBANK.NS",  name: "HDFC Bank",        trend: "neutral", confidence: 55, currentPrice: 1623,  predictedPrice: 1629,  pctChange: 0.37,  time: "2 days ago"  },
  { id: 6, symbol: "RELIANCE.NS",  name: "Reliance",         trend: "bullish", confidence: 79, currentPrice: 2941,  predictedPrice: 3020,  pctChange: 2.69,  time: "3 days ago"  },
];

const TREND_STYLE = {
  bullish: { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",   border: "rgba(0,229,160,0.25)",   icon: "📈" },
  bearish: { color: "#ff4d6d", bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.25)",  icon: "📉" },
  neutral: { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.25)", icon: "➡️" },
};

const PredictionHistory = ({ history = MOCK_HISTORY, onRerun }) => {
  if (history.length === 0) {
    return (
      <div style={{
        background:   "#0e1525",
        border:       "1px solid #1a2540",
        borderRadius: "16px",
        padding:      "48px 24px",
        textAlign:    "center",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤖</div>
        <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>
          No predictions yet
        </div>
        <div style={{ fontSize: "12px", color: "#64748b" }}>
          Select a stock above and run your first prediction
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      overflow:     "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding:      "20px 24px",
        borderBottom: "1px solid #1a2540",
        display:      "flex",
        alignItems:   "center",
        gap:          "8px",
      }}>
        <span style={{ fontSize: "16px" }}>🕒</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Prediction History — {history.length} runs
        </span>
      </div>

      {/* Table header */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "2fr 100px 1fr 1fr 1fr 80px 100px",
        gap:                 "8px",
        padding:             "10px 24px",
        background:          "#0a1020",
        borderBottom:        "1px solid #1a2540",
      }}>
        {["Stock", "Trend", "Current", "Predicted", "Change", "Conf.", "Time"].map(h => (
          <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {history.map((p) => {
        const ts    = TREND_STYLE[p.trend];
        const isUp  = p.pctChange >= 0;
        const short = p.symbol.replace(".NS", "");

        return (
          <div
            key={p.id}
            style={{
              display:             "grid",
              gridTemplateColumns: "2fr 100px 1fr 1fr 1fr 80px 100px",
              gap:                 "8px",
              alignItems:          "center",
              padding:             "13px 24px",
              borderBottom:        "1px solid #1a2540",
              transition:          "background 0.15s",
              cursor:              "default",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#131d30"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: `${ts.color}18`, border: `1px solid ${ts.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "9px", fontWeight: "700", color: ts.color, flexShrink: 0,
              }}>
                {short.slice(0, 3)}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>{p.name}</div>
              </div>
            </div>

            {/* Trend */}
            <span style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "4px",
              fontSize:     "11px",
              fontWeight:   "700",
              padding:      "3px 8px",
              borderRadius: "6px",
              background:   ts.bg,
              color:        ts.color,
              border:       `1px solid ${ts.border}`,
              whiteSpace:   "nowrap",
            }}>
              {ts.icon} {p.trend.charAt(0).toUpperCase() + p.trend.slice(1)}
            </span>

            {/* Current */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>
              ₹{p.currentPrice.toLocaleString("en-IN")}
            </div>

            {/* Predicted */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "600", color: ts.color }}>
              ₹{p.predictedPrice.toLocaleString("en-IN")}
            </div>

            {/* % Change */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
              {isUp ? "+" : ""}{p.pctChange}%
            </div>

            {/* Confidence */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: p.confidence >= 75 ? "#00e5a0" : p.confidence >= 55 ? "#ffd166" : "#ff4d6d" }}>
              {p.confidence}%
            </div>

            {/* Rerun button */}
            <button
              onClick={() => onRerun && onRerun(p.symbol)}
              style={{
                background:   "transparent",
                border:       "1px solid #1a2540",
                borderRadius: "7px",
                color:        "#64748b",
                fontFamily:   "'Poppins', sans-serif",
                fontSize:     "11px",
                fontWeight:   "500",
                padding:      "4px 10px",
                cursor:       "pointer",
                transition:   "all 0.15s",
                whiteSpace:   "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#64748b"; }}
            >
              ↺ Rerun
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PredictionHistory;