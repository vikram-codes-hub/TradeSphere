import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../Context/DashboardContext";

const th = {
  fontSize: "10px", fontWeight: "600", color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 0 10px 0",
};

const HoldingsPreview = () => {
  const navigate           = useNavigate();
  const { holdings, loading } = useDashboard();

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>💼</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Your Holdings
          </span>
        </div>
        <button onClick={() => navigate("/portfolio")} style={{ background: "none", border: "none", color: "#2d7ef7", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
          View All →
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1,2,3].map(i => <div key={i} style={{ height: "52px", background: "#1a2540", borderRadius: "12px", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && holdings.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b", fontSize: "13px" }}>
          No holdings yet. <span style={{ color: "#2d7ef7", cursor: "pointer" }} onClick={() => navigate("/market")}>Browse markets →</span>
        </div>
      )}

      {/* Table header */}
      {!loading && holdings.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr", gap: "12px", padding: "0 12px", borderBottom: "1px solid #1a2540", paddingBottom: "10px", marginBottom: "4px" }}>
            {["Stock", "Qty / Avg Buy", "Current Price", "P&L"].map((h) => (
              <span key={h} style={th}>{h}</span>
            ))}
          </div>

          {holdings.map((h) => {
            const pnl    = (h.currentPrice - h.avgBuyPrice) * h.quantity;
            const pnlPct = (((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100).toFixed(2);
            const isUp   = pnl >= 0;
            const short  = h.symbol.replace(".NS", "");

            return (
              <div
                key={h.symbol}
                onClick={() => navigate(`/trade/${h.symbol}`)}
                style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr", gap: "12px", alignItems: "center", padding: "12px", borderRadius: "12px", cursor: "pointer", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#131d30", border: "1px solid #1a2540", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#2d7ef7", flexShrink: 0 }}>
                    {short.slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{h.name}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#e2e8f0", fontWeight: "600" }}>{h.quantity} shares</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#64748b", marginTop: "2px" }}>avg ₹{h.avgBuyPrice?.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                  ₹{h.currentPrice?.toLocaleString("en-IN")}
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
                    {isUp ? "+" : "-"}₹{Math.abs(pnl).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "600", color: isUp ? "#00e5a0" : "#ff4d6d", marginTop: "2px" }}>
                    {isUp ? "+" : ""}{pnlPct}%
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default HoldingsPreview;