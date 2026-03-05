const ModelStats = ({ result }) => {
  if (!result) return null;

  const r2Color    = result.r2 >= 0.8 ? "#00e5a0" : result.r2 >= 0.6 ? "#ffd166" : "#ff4d6d";
  const rmseColor  = result.rmse <= 200 ? "#00e5a0" : result.rmse <= 500 ? "#ffd166" : "#ff4d6d";

  const stats = [
    {
      label:   "Model Used",
      value:   result.modelUsed,
      sub:     "ML Algorithm",
      icon:    "🧠",
      color:   "#a78bfa",
      mono:    false,
    },
    {
      label:   "R² Score",
      value:   result.r2.toFixed(3),
      sub:     result.r2 >= 0.8 ? "Excellent fit" : result.r2 >= 0.6 ? "Good fit" : "Moderate fit",
      icon:    "📐",
      color:   r2Color,
      mono:    true,
    },
    {
      label:   "RMSE",
      value:   `₹${result.rmse}`,
      sub:     "Avg error margin",
      icon:    "📏",
      color:   rmseColor,
      mono:    true,
    },
    {
      label:   "Training Data",
      value:   "365 days",
      sub:     "Yahoo Finance OHLCV",
      icon:    "📅",
      color:   "#2d7ef7",
      mono:    false,
    },
  ];

  const features = [
    "RSI (14)",
    "Bollinger Bands",
    "MACD",
    "SMA 20 / 50",
    "EMA 12 / 26",
    "Volume",
    "Price momentum",
    "Daily returns",
  ];

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      padding:      "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <span style={{ fontSize: "16px" }}>⚙️</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Model Details
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background:   "#131d30",
            border:       "1px solid #1a2540",
            borderRadius: "12px",
            padding:      "14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {stat.label}
              </span>
              <span style={{ fontSize: "14px" }}>{stat.icon}</span>
            </div>
            <div style={{
              fontFamily: stat.mono ? "'JetBrains Mono', monospace" : "'Poppins', sans-serif",
              fontSize:   "16px",
              fontWeight: "700",
              color:      stat.color,
              marginBottom: "3px",
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Features used */}
      <div>
        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
          Features Used
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {features.map((f) => (
            <span key={f} style={{
              fontSize:     "10px",
              fontWeight:   "500",
              padding:      "3px 10px",
              borderRadius: "6px",
              background:   "rgba(45,126,247,0.08)",
              color:        "#64748b",
              border:       "1px solid rgba(45,126,247,0.12)",
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop:  "16px",
        padding:    "10px 12px",
        background: "rgba(255,209,102,0.05)",
        border:     "1px solid rgba(255,209,102,0.12)",
        borderRadius: "8px",
        fontSize:   "10px",
        color:      "#64748b",
        lineHeight: "1.6",
      }}>
        ⚠️ Predictions are for educational purposes only. Not financial advice. Past performance does not guarantee future results.
      </div>
    </div>
  );
};

export default ModelStats;