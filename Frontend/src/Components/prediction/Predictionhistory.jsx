const TREND_STYLE = {
  bullish: { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",   border: "rgba(0,229,160,0.25)",   icon: "📈" },
  bearish: { color: "#ff4d6d", bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.25)",  icon: "📉" },
  neutral: { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.25)", icon: "➡️" },
};

const PredictionHistory = ({ history = [], loading = false, onRerun }) => {
  if (loading) {
    return (
      <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #1a2540", borderTop: "3px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <div style={{ fontSize: "13px", color: "#64748b" }}>Loading history...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤖</div>
        <div style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" }}>No predictions yet</div>
        <div style={{ fontSize: "12px", color: "#64748b" }}>Select a stock above and run your first prediction</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a2540", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>🕒</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Prediction History — {history.length} runs
        </span>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 1fr 1fr 1fr 80px 100px", gap: "8px", padding: "10px 24px", background: "#0a1020", borderBottom: "1px solid #1a2540" }}>
        {["Stock", "Trend", "Current", "Predicted", "Change", "Conf.", ""].map((h, i) => (
          <span key={i} style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
        ))}
      </div>

      {history.map((p, i) => {
        // Normalise fields — API may use different names
        const symbol    = p.symbol        ?? p.stockSymbol  ?? "—";
        const name      = p.companyName   ?? p.name         ?? symbol;
        const curPrice  = p.currentPrice  ?? p.lastPrice    ?? 0;
        const predPrice = p.predictedPrice ?? p.prediction  ?? 0;
        const pctChange = p.pctChange     ?? p.changePercent ?? (curPrice > 0 ? parseFloat((((predPrice - curPrice) / curPrice) * 100).toFixed(2)) : 0);
        const trend     = p.trend         ?? (pctChange > 1 ? "bullish" : pctChange < -1 ? "bearish" : "neutral");
        const conf      = p.confidence    ?? p.confidenceScore ?? 0;
        const time      = p.createdAt
          ? new Date(p.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
          : p.time ?? "";

        const ts    = TREND_STYLE[trend] ?? TREND_STYLE.neutral;
        const isUp  = pctChange >= 0;
        const short = symbol.replace(".NS", "");

        return (
          <div key={p._id ?? p.id ?? i}
            style={{ display: "grid", gridTemplateColumns: "2fr 100px 1fr 1fr 1fr 80px 100px", gap: "8px", alignItems: "center", padding: "13px 24px", borderBottom: "1px solid #1a2540", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#131d30"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

            {/* Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${ts.color}18`, border: `1px solid ${ts.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "700", color: ts.color, flexShrink: 0 }}>
                {short.slice(0, 3)}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>{name}</div>
              </div>
            </div>

            {/* Trend */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, whiteSpace: "nowrap" }}>
              {ts.icon} {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </span>

            {/* Current */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>
              ₹{Number(curPrice).toLocaleString("en-IN")}
            </div>

            {/* Predicted */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "600", color: ts.color }}>
              ₹{Number(predPrice).toLocaleString("en-IN")}
            </div>

            {/* % Change */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
              {isUp ? "+" : ""}{Number(pctChange).toFixed(2)}%
            </div>

            {/* Confidence */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: conf >= 75 ? "#00e5a0" : conf >= 55 ? "#ffd166" : "#ff4d6d" }}>
              {conf}%
            </div>

            {/* Rerun */}
            <button onClick={() => onRerun && onRerun(symbol)}
              style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "7px", color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: "500", padding: "4px 10px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#64748b"; }}>
              ↺ Rerun
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PredictionHistory;