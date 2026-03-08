  const StatCard = ({ title, value, sub, icon, trend, sparkline, loading }) => {
    const isUp   = trend === "up";
    const isDown = trend === "down";

    // ── Skeleton while loading ────────────────────────────
    if (loading) {
      return (
        <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ height: "10px", width: "70px", background: "#1a2540", borderRadius: "4px", animation: "shimmer 1.5s infinite" }} />
            <div style={{ height: "20px", width: "20px", background: "#1a2540", borderRadius: "6px" }} />
          </div>
          <div style={{ height: "22px", width: "100px", background: "#1a2540", borderRadius: "4px", animation: "shimmer 1.5s infinite" }} />
          <div style={{ height: "32px", background: "#1a2540", borderRadius: "4px", animation: "shimmer 1.5s infinite" }} />
          <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      );
    }

    return (
      <div style={{
        background:    "#0e1525",
        border:        "1px solid #1a2540",
        borderRadius:  "16px",
        padding:       "20px",
        display:       "flex",
        flexDirection: "column",
        gap:           "12px",
        transition:    "all 0.2s ease",
        cursor:        "default",
      }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {title}
          </span>
          <span style={{ fontSize: "20px" }}>{icon}</span>
        </div>

        {/* Value row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em",
            color: isUp ? "#00e5a0" : isDown ? "#ff4d6d" : "#e2e8f0",
          }}>
            {value}
          </span>
          {sub && (
            <span style={{ fontSize: "12px", fontWeight: "600", marginBottom: "2px", color: isUp ? "#00e5a0" : isDown ? "#ff4d6d" : "#64748b" }}>
              {sub}
            </span>
          )}
        </div>

        {/* Sparkline */}
        {sparkline && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "32px" }}>
            {sparkline.map((val, i) => {
              const max    = Math.max(...sparkline);
              const height = Math.max((val / max) * 100, 8);
              const isLast = i === sparkline.length - 1;
              return (
                <div key={i} style={{
                  flex: "1", height: `${height}%`, borderRadius: "2px",
                  background: isLast
                    ? (isDown ? "#ff4d6d" : "#00e5a0")
                    : (isDown ? "rgba(255,77,109,0.2)" : "rgba(0,229,160,0.2)"),
                  transition: "height 0.3s ease",
                }} />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  export default StatCard;