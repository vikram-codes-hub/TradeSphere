const AdminStats = ({ stats }) => {
  const cards = [
    { label: "Total Users",     value: stats.totalUsers.toLocaleString(),     sub: `+${stats.newToday} today`,        icon: "👥", color: "#2d7ef7"  },
    { label: "Total Trades",    value: stats.totalTrades.toLocaleString(),    sub: `${stats.tradesPerHour}/hr avg`,   icon: "⚡", color: "#00e5a0"  },
    { label: "Premium Users",   value: stats.premiumUsers.toLocaleString(),   sub: `${((stats.premiumUsers/stats.totalUsers)*100).toFixed(1)}% conversion`, icon: "⭐", color: "#ffd166"  },
    { label: "ML Jobs Today",   value: stats.mlJobs.toLocaleString(),         sub: `${stats.mlRunning} running now`,  icon: "🤖", color: "#a78bfa"  },
    { label: "Active Now",      value: stats.activeNow.toLocaleString(),      sub: "online users",                    icon: "🟢", color: "#00e5a0"  },
    { label: "Halted Stocks",   value: stats.haltedStocks.toString(),         sub: stats.haltedStocks > 0 ? "⚠️ needs review" : "all clear", icon: "🔴", color: stats.haltedStocks > 0 ? "#ff4d6d" : "#00e5a0" },
  ];

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap:                 "12px",
      marginBottom:        "20px",
    }}>
      {cards.map((card) => (
        <div key={card.label} style={{
          background:   "#0e1525",
          border:       "1px solid #1a2540",
          borderRadius: "14px",
          padding:      "16px",
          transition:   "border-color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#243050"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2540"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {card.label}
            </span>
            <span style={{ fontSize: "18px" }}>{card.icon}</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "20px", fontWeight: "700", color: card.color, marginBottom: "4px" }}>
            {card.value}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>{card.sub}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;