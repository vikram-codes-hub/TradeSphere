import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../Context/Dashboardcontext";

const PredictionHighlights = ({ isPremium }) => {
  const navigate                   = useNavigate();
  const { predictions, loading }   = useDashboard();

  if (!isPremium) {
    return (
      <div style={{ background: "#0e1525", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden", minHeight: "200px" }}>
        <div style={{ opacity: 0.2, pointerEvents: "none" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>🤖 AI Prediction Highlights</div>
          {[1,2,3].map(i => <div key={i} style={{ height: "52px", background: "#131d30", borderRadius: "12px", marginBottom: "8px" }} />)}
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", backdropFilter: "blur(4px)", background: "rgba(9,14,26,0.6)", borderRadius: "16px" }}>
          <div style={{ fontSize: "40px" }}>🔒</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>Premium Feature</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>Upgrade to unlock AI price predictions</div>
            <button onClick={() => navigate("/upgrade")} style={{ background: "linear-gradient(135deg, #a78bfa, #2d7ef7)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: "700", padding: "10px 20px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
              ⭐ Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0e1525", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "16px", padding: "24px", boxShadow: "0 0 32px rgba(167,139,250,0.06)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>🤖</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Predictions</span>
          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "100px", background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)", letterSpacing: "0.06em" }}>PREMIUM</span>
        </div>
        <button onClick={() => navigate("/predictions")} style={{ background: "none", border: "none", color: "#a78bfa", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
          View All →
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1,2,3].map(i => <div key={i} style={{ height: "52px", background: "#1a2540", borderRadius: "12px", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && predictions.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b", fontSize: "13px" }}>
          No predictions yet. <span style={{ color: "#a78bfa", cursor: "pointer" }} onClick={() => navigate("/predictions")}>Run a prediction →</span>
        </div>
      )}

      {/* Predictions */}
      {!loading && predictions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {predictions.slice(0, 3).map((p) => {
            const pct   = (((p.predictedPrice - p.currentPrice) / p.currentPrice) * 100).toFixed(2);
            const isUp  = p.trend === "bullish" || pct >= 0;
            const short = p.symbol.replace(".NS", "");

            return (
              <div
                key={p._id ?? p.symbol}
                onClick={() => navigate(`/predictions?symbol=${p.symbol}`)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#a78bfa", flexShrink: 0 }}>
                    {short.slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 7px", borderRadius: "4px", background: isUp ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
                        {isUp ? "📈 Bullish" : "📉 Bearish"}
                      </span>
                      <span style={{ fontSize: "10px", color: "#64748b" }}>{p.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>₹{p.predictedPrice?.toLocaleString("en-IN")}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d", marginTop: "2px" }}>
                    {pct >= 0 ? "+" : ""}{pct}% predicted
                  </div>
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

export default PredictionHighlights;