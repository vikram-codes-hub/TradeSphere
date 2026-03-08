import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../Context/Dashboardcontext";


const RecentTrades = () => {
  const navigate             = useNavigate();
  const { trades, loading }  = useDashboard();

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Trades</span>
        </div>
        <button onClick={() => navigate("/portfolio")} style={{ background: "none", border: "none", color: "#2d7ef7", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
          View All →
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: "44px", background: "#1a2540", borderRadius: "12px", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && trades.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b", fontSize: "13px" }}>
          No trades yet. <span style={{ color: "#2d7ef7", cursor: "pointer" }} onClick={() => navigate("/market")}>Start trading →</span>
        </div>
      )}

      {/* Trades */}
      {!loading && trades.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {trades.map((trade) => {
            const isBuy = trade.type === "BUY";
            const total = trade.quantity * trade.price;
            const short = trade.symbol.replace(".NS", "");
            const time  = new Date(trade.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={trade._id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "12px", transition: "background 0.15s ease", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: "700", flexShrink: 0,
                    background: isBuy ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)",
                    color:      isBuy ? "#00e5a0"              : "#ff4d6d",
                    border:     `1px solid ${isBuy ? "rgba(0,229,160,0.25)" : "rgba(255,77,109,0.25)"}`,
                  }}>
                    {trade.type}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px", fontFamily: "'JetBrains Mono', monospace" }}>
                      {trade.quantity} × ₹{trade.price?.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: isBuy ? "#ff4d6d" : "#00e5a0" }}>
                    {isBuy ? "-" : "+"}₹{total?.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default RecentTrades;