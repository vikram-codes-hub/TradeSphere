import { useNavigate } from "react-router-dom";

const StockHeader = ({ stock }) => {
  const navigate = useNavigate();

  // ✅ Normalise field names from real API
  const price     = stock.currentPrice  ?? stock.price    ?? 0;
  const change    = stock.priceChange    ?? stock.change   ?? 0;
  const changePct = stock.priceChangePct ?? stock.changePct ?? 0;
  const name      = stock.companyName   ?? stock.name     ?? stock.symbol;
  const isUp      = changePct >= 0;

  return (
    <div style={{
      background:    "#0e1525",
      border:        "1px solid #1a2540",
      borderRadius:  "16px",
      padding:       "20px 24px",
      marginBottom:  "20px",
      display:       "flex",
      alignItems:    "center",
      justifyContent:"space-between",
      flexWrap:      "wrap",
      gap:           "16px",
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => navigate("/market")}
          style={{ background: "#131d30", border: "1px solid #1a2540", borderRadius: "10px", color: "#94a3b8", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: "600", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1a2540"; e.currentTarget.style.color = "#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#131d30"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          ← Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(45,126,247,0.2), rgba(45,126,247,0.05))", border: "1px solid rgba(45,126,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#2d7ef7" }}>
            {stock.symbol.replace(".NS", "").slice(0, 3)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#e2e8f0" }}>
                {stock.symbol.replace(".NS", "")}
              </span>
              <span style={{ fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: stock.exchange === "NSE" ? "rgba(45,126,247,0.12)" : "rgba(167,139,250,0.12)", color: stock.exchange === "NSE" ? "#2d7ef7" : "#a78bfa", letterSpacing: "0.06em" }}>
                {stock.exchange}
              </span>
              {stock.isHalted && (
                <span style={{ fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: "rgba(255,77,109,0.12)", color: "#ff4d6d", letterSpacing: "0.06em" }}>HALTED</span>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{name} · {stock.sector}</div>
          </div>
        </div>
      </div>

      {/* Right — price */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5a0", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#00e5a0" }}>LIVE</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "28px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.02em" }}>
            ₹{price.toLocaleString("en-IN")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end", marginTop: "3px" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
              {isUp ? "+" : ""}₹{Math.abs(change).toFixed(2)}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", background: isUp ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)", color: isUp ? "#00e5a0" : "#ff4d6d", border: `1px solid ${isUp ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}` }}>
              {isUp ? "▲" : "▼"} {Math.abs(changePct).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }`}</style>
    </div>
  );
};

export default StockHeader;