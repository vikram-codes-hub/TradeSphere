const MarketSummaryBar = ({ stocks = [], loading = false }) => {
  // API returns changePercent — fallback to changePct (mock field name)
  const total   = stocks.length;
  const gainers = stocks.filter(s => (s.changePercent ?? s.changePct ?? 0) > 0).length;
  const losers  = stocks.filter(s => (s.changePercent ?? s.changePct ?? 0) < 0).length;
  const neutral = total - gainers - losers;

  const items = [
    { label: "Total Stocks", value: total,   color: "#e2e8f0", icon: "📊" },
    { label: "Gainers",      value: gainers, color: "#00e5a0", icon: "📈" },
    { label: "Losers",       value: losers,  color: "#ff4d6d", icon: "📉" },
    { label: "Neutral",      value: neutral, color: "#ffd166", icon: "➡️"  },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
      {items.map((item) => (
        <div key={item.label} style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "22px" }}>{item.icon}</span>
          <div>
            {loading ? (
              <div style={{ width: "32px", height: "22px", background: "#1a2540", borderRadius: "4px", animation: "shimmer 1.5s infinite" }} />
            ) : (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "22px", fontWeight: "700", color: item.color, lineHeight: "1" }}>
                {item.value}
              </div>
            )}
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default MarketSummaryBar;