const OHLCVBar = ({ stock }) => {
  const stats = [
    { label: "Open",     value: `₹${stock.open.toLocaleString("en-IN")}`,     color: "#e2e8f0" },
    { label: "High",     value: `₹${stock.high.toLocaleString("en-IN")}`,     color: "#00e5a0" },
    { label: "Low",      value: `₹${stock.low.toLocaleString("en-IN")}`,      color: "#ff4d6d" },
    { label: "Close",    value: `₹${stock.close.toLocaleString("en-IN")}`,    color: "#e2e8f0" },
    { label: "Volume",   value: stock.volume >= 1000000 ? `${(stock.volume / 1000000).toFixed(2)}M` : `${(stock.volume / 1000).toFixed(0)}K`, color: "#2d7ef7" },
    { label: "Mkt Cap",  value: stock.marketCap >= 1e9  ? `₹${(stock.marketCap / 1e9).toFixed(1)}B`  : `₹${(stock.marketCap / 1e6).toFixed(0)}M`, color: "#94a3b8" },
  ];

  // Day range bar
  const rangeMin  = stock.low;
  const rangeMax  = stock.high;
  const rangePct  = ((stock.price - rangeMin) / (rangeMax - rangeMin)) * 100;

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      padding:      "20px 24px",
      marginBottom: "20px",
    }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Day range bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>Day Range</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#64748b" }}>
            ₹{rangeMin.toLocaleString("en-IN")} — ₹{rangeMax.toLocaleString("en-IN")}
          </span>
        </div>
        <div style={{ position: "relative", height: "6px", background: "#1a2540", borderRadius: "3px" }}>
          <div style={{
            position:     "absolute",
            left:         "0",
            width:        "100%",
            height:       "100%",
            borderRadius: "3px",
            background:   "linear-gradient(90deg, #ff4d6d, #ffd166, #00e5a0)",
            opacity:      0.3,
          }} />
          {/* Current price indicator */}
          <div style={{
            position:     "absolute",
            left:         `${Math.min(Math.max(rangePct, 0), 100)}%`,
            top:          "50%",
            transform:    "translate(-50%, -50%)",
            width:        "12px",
            height:       "12px",
            borderRadius: "50%",
            background:   "#e2e8f0",
            border:       "2px solid #090e1a",
            boxShadow:    "0 0 6px rgba(255,255,255,0.3)",
          }} />
        </div>
      </div>
    </div>
  );
};

export default OHLCVBar;