const Hero = ({ activeTab, setActiveTab, lastUpdated, globalStats, loading }) => {
  const stats = [
    {
      label: "TOTAL TRADES",
      icon:  "⚡",
      value: globalStats?.totalTrades
        ?? globalStats?.total_trades
        ?? (loading ? "—" : "—"),
      format: (v) => typeof v === "number" ? v.toLocaleString("en-IN") : v,
    },
    {
      label: "VIRTUAL P&L GENERATED",
      icon:  "💰",
      value: globalStats?.totalPnl
        ?? globalStats?.totalPnL
        ?? globalStats?.total_pnl
        ?? (loading ? "—" : "—"),
      format: (v) => typeof v === "number"
        ? v >= 10000000 ? `₹${(v / 10000000).toFixed(1)} Cr`
        : v >= 100000  ? `₹${(v / 100000).toFixed(1)} L`
        : `₹${v.toLocaleString("en-IN")}`
        : v,
    },
    {
      label: "ACTIVE TRADERS",
      icon:  "👥",
      value: globalStats?.activeTraders
        ?? globalStats?.active_traders
        ?? globalStats?.totalUsers
        ?? (loading ? "—" : "—"),
      format: (v) => typeof v === "number" ? v.toLocaleString("en-IN") : v,
    },
  ];

  return (
    <div style={{ borderBottom: "1px solid #1e2d3d", padding: "32px 32px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ color: "#f0b429", fontSize: "11px", letterSpacing: "4px", fontFamily: "monospace", fontWeight: "700", marginBottom: "6px" }}>
            TRADESPHERE
          </div>
          <h1 style={{ fontFamily: '"Georgia", serif', fontSize: "42px", color: "#e8eaed", letterSpacing: "-1px", lineHeight: 1, fontWeight: "bold", margin: 0 }}>
            Leaderboard
          </h1>
          <p style={{ color: "#4a6580", fontSize: "13px", fontFamily: "monospace", marginTop: "6px" }}>
            Ranked by total realized P&L
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ color: "#4a6580", fontSize: "12px", fontFamily: "monospace" }}>
              Updated {lastUpdated}s ago
            </span>
          </div>

          {/* Tab toggle */}
          <div style={{ background: "#0d1b2a", border: "1px solid #1e2d3d", borderRadius: "999px", padding: "3px", display: "flex" }}>
            {["All Time", "This Week"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "6px 20px", borderRadius: "999px", fontSize: "12px", fontFamily: "monospace", fontWeight: "600", letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s", background: activeTab === tab ? "#f0b429" : "transparent", color: activeTab === tab ? "#000" : "#4a6580", border: "none" }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ background: "#0d1b2a", border: "1px solid #1e2d3d", borderRadius: "10px", padding: "14px 18px" }}>
            <div style={{ color: "#4a6580", fontSize: "10px", letterSpacing: "2px", fontFamily: "monospace", marginBottom: "6px" }}>
              {stat.icon} {stat.label}
            </div>
            <div style={{ color: loading ? "#374151" : "#e8eaed", fontSize: "22px", fontFamily: '"Georgia", serif', fontWeight: "bold", transition: "color 0.3s" }}>
              {stat.format(stat.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;