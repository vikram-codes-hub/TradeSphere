const TREND_CONFIG = {
  bullish: { label: "Bullish",  icon: "📈", color: "#00e5a0", bg: "rgba(0,229,160,0.08)",  border: "rgba(0,229,160,0.2)"  },
  bearish: { label: "Bearish",  icon: "📉", color: "#ff4d6d", bg: "rgba(255,77,109,0.08)", border: "rgba(255,77,109,0.2)" },
  neutral: { label: "Neutral",  icon: "➡️",  color: "#ffd166", bg: "rgba(255,209,102,0.08)",border: "rgba(255,209,102,0.2)"},
};

const ConfidenceBar = ({ value }) => {
  const color = value >= 75 ? "#00e5a0" : value >= 55 ? "#ffd166" : "#ff4d6d";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Confidence Score
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: "700", color }}>
          {value}%
        </span>
      </div>
      <div style={{ height: "8px", background: "#1a2540", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{
          height:     "100%",
          width:      `${value}%`,
          borderRadius: "4px",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: "width 1s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontSize: "10px", color: "#374151" }}>Low</span>
        <span style={{ fontSize: "10px", color: "#374151" }}>High</span>
      </div>
    </div>
  );
};

const PredictionResult = ({ result }) => {
  if (!result) return null;

  const trend  = TREND_CONFIG[result.trend] || TREND_CONFIG.neutral;
  const isUp   = result.pctChange >= 0;
  const short  = result.symbol.replace(".NS", "");

  return (
    <div style={{
      background:   "#0e1525",
      border:       `1px solid ${trend.border}`,
      borderRadius: "16px",
      padding:      "28px",
      marginBottom: "20px",
      boxShadow:    `0 0 40px ${trend.bg}`,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Stock avatar */}
          <div style={{
            width:          "52px",
            height:         "52px",
            borderRadius:   "14px",
            background:     `linear-gradient(135deg, ${trend.color}22, ${trend.color}08)`,
            border:         `1px solid ${trend.border}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       "14px",
            fontWeight:     "800",
            color:          trend.color,
          }}>
            {short.slice(0, 3)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px", fontWeight: "800", color: "#e2e8f0" }}>{short}</span>
              <span style={{
                fontSize:    "12px",
                fontWeight:  "700",
                padding:     "4px 12px",
                borderRadius:"8px",
                background:  trend.bg,
                color:       trend.color,
                border:      `1px solid ${trend.border}`,
              }}>
                {trend.icon} {trend.label}
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "3px" }}>{result.companyName}</div>
          </div>
        </div>

        {/* Timestamp */}
        <div style={{ fontSize: "11px", color: "#374151", textAlign: "right" }}>
          <div>Predicted at</div>
          <div style={{ color: "#64748b", marginTop: "2px" }}>{result.predictedAt}</div>
        </div>
      </div>

      {/* Price comparison */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap:                 "16px",
        alignItems:          "center",
        background:          "#090e1a",
        border:              "1px solid #1a2540",
        borderRadius:        "14px",
        padding:             "20px 24px",
        marginBottom:        "24px",
      }}>
        {/* Current price */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            Current Price
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "26px", fontWeight: "700", color: "#e2e8f0" }}>
            ₹{result.currentPrice.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>today</div>
        </div>

        {/* Arrow */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize:   "28px",
            color:      trend.color,
            animation:  "arrowPulse 1.5s ease-in-out infinite",
          }}>
            {isUp ? "→" : "→"}
          </div>
          <div style={{
            fontFamily:   "'JetBrains Mono', monospace",
            fontSize:     "14px",
            fontWeight:   "700",
            color:        isUp ? "#00e5a0" : "#ff4d6d",
            marginTop:    "4px",
          }}>
            {isUp ? "+" : ""}{result.pctChange}%
          </div>
        </div>

        {/* Predicted price */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            Predicted Price
          </div>
          <div style={{
            fontFamily:  "'JetBrains Mono', monospace",
            fontSize:    "26px",
            fontWeight:  "700",
            color:       trend.color,
          }}>
            ₹{result.predictedPrice.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>tomorrow</div>
        </div>
      </div>

      {/* Confidence bar */}
      <ConfidenceBar value={result.confidence} />

      <style>{`
        @keyframes arrowPulse {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50%       { transform: translateX(4px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default PredictionResult;