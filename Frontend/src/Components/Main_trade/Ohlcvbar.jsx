const OHLCVBar = ({ stock }) => {
  // ✅ Normalise field names from real API
  const price     = stock.currentPrice  ?? stock.price  ?? 0;
  const open      = stock.openPrice     ?? stock.open   ?? 0;
  const high      = stock.dayHigh       ?? stock.high   ?? 0;
  const low       = stock.dayLow        ?? stock.low    ?? 0;
  const close     = stock.previousClose ?? stock.close  ?? 0;
  const volume    = stock.volume        ?? 0;
  const marketCap = stock.marketCap     ?? 0;

  const stats = [
    { label: "Open",    value: `₹${open.toLocaleString("en-IN")}`,    color: "#e2e8f0" },
    { label: "High",    value: `₹${high.toLocaleString("en-IN")}`,    color: "#00e5a0" },
    { label: "Low",     value: `₹${low.toLocaleString("en-IN")}`,     color: "#ff4d6d" },
    { label: "Close",   value: `₹${close.toLocaleString("en-IN")}`,   color: "#e2e8f0" },
    { label: "Volume",  value: volume >= 1_000_000 ? `${(volume / 1_000_000).toFixed(2)}M` : volume >= 1_000 ? `${(volume / 1_000).toFixed(0)}K` : String(volume), color: "#2d7ef7" },
    { label: "Mkt Cap", value: marketCap >= 1e12 ? `₹${(marketCap / 1e12).toFixed(2)}T` : marketCap >= 1e9 ? `₹${(marketCap / 1e9).toFixed(1)}B` : marketCap >= 1e6 ? `₹${(marketCap / 1e6).toFixed(0)}M` : "N/A", color: "#94a3b8" },
  ];

  // Day range bar
  const rangeMin = low;
  const rangeMax = high;
  const rangePct = rangeMax > rangeMin ? ((price - rangeMin) / (rangeMax - rangeMin)) * 100 : 50;

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      padding:      "20px 24px",
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
            ₹{low.toLocaleString("en-IN")} — ₹{high.toLocaleString("en-IN")}
          </span>
        </div>
        <div style={{ position: "relative", height: "6px", background: "#1a2540", borderRadius: "3px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "3px", background: "linear-gradient(90deg, #ff4d6d, #ffd166, #00e5a0)", opacity: 0.3 }} />
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