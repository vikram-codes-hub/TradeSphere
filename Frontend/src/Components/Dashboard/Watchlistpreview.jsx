import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../Context/Dashboardcontext";

const WatchlistPreview = () => {
  const navigate              = useNavigate();
  const { watchlist, loading } = useDashboard();

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⭐</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Watchlist</span>
        </div>
        <button onClick={() => navigate("/watchlist")} style={{ background: "none", border: "none", color: "#2d7ef7", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
          View All →
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: "44px", background: "#1a2540", borderRadius: "12px", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && watchlist.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b", fontSize: "13px" }}>
          No stocks saved. <span style={{ color: "#2d7ef7", cursor: "pointer" }} onClick={() => navigate("/market")}>Browse markets →</span>
        </div>
      )}

      {/* Items */}
      {!loading && watchlist.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {watchlist.map((stock) => {
            const isUp  = (stock.change ?? stock.changePercent ?? 0) >= 0;
            const chg   = stock.change ?? stock.changePercent ?? 0;
            const short = stock.symbol.replace(".NS", "");

            return (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/trade/${stock.symbol}`)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#131d30", border: "1px solid #1a2540", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#2d7ef7", flexShrink: 0 }}>
                    {short.slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{stock.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                    ₹{stock.currentPrice?.toLocaleString("en-IN") ?? "—"}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d", marginTop: "1px" }}>
                    {isUp ? "+" : ""}{chg?.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add more */}
      <button
        onClick={() => navigate("/market")}
        style={{ width: "100%", marginTop: "12px", padding: "10px", borderRadius: "12px", border: "1px dashed #1a2540", background: "transparent", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "all 0.2s ease" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2d7ef7"; e.currentTarget.style.color = "#2d7ef7"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#64748b"; }}
      >
        + Add more stocks
      </button>

      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default WatchlistPreview;