const PortfolioStats = ({ stats }) => {
  const cards = [
    {
      label: "Total Invested",
      value: `₹${stats.totalInvested.toLocaleString("en-IN")}`,
      sub:   `${stats.holdingsCount} stocks`,
      icon:  "💼",
      color: "#e2e8f0",
      trend: null,
    },
    {
      label: "Current Value",
      value: `₹${stats.currentValue.toLocaleString("en-IN")}`,
      sub:   "live market value",
      icon:  "📊",
      color: "#2d7ef7",
      trend: null,
    },
    {
      label: "Unrealised P&L",
      value: `${stats.unrealisedPnL >= 0 ? "+" : ""}₹${Math.abs(stats.unrealisedPnL).toLocaleString("en-IN")}`,
      sub:   `${stats.unrealisedPct >= 0 ? "+" : ""}${stats.unrealisedPct}% overall`,
      icon:  stats.unrealisedPnL >= 0 ? "📈" : "📉",
      color: stats.unrealisedPnL >= 0 ? "#00e5a0" : "#ff4d6d",
      trend: stats.unrealisedPnL >= 0 ? "up" : "down",
    },
    {
      label: "Realised P&L",
      value: `${stats.realisedPnL >= 0 ? "+" : ""}₹${Math.abs(stats.realisedPnL).toLocaleString("en-IN")}`,
      sub:   `${stats.totalTrades} trades · ${stats.winRate}% win rate`,
      icon:  "🎯",
      color: stats.realisedPnL >= 0 ? "#00e5a0" : "#ff4d6d",
      trend: stats.realisedPnL >= 0 ? "up" : "down",
    },
  ];

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap:                 "16px",
      marginBottom:        "20px",
    }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background:   "#0e1525",
            border:       "1px solid #1a2540",
            borderRadius: "16px",
            padding:      "20px",
            transition:   "border-color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#243050"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2540"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {card.label}
            </span>
            <span style={{ fontSize: "20px" }}>{card.icon}</span>
          </div>
          <div style={{
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      "22px",
            fontWeight:    "700",
            color:         card.color,
            letterSpacing: "-0.02em",
            marginBottom:  "6px",
          }}>
            {card.value}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioStats;