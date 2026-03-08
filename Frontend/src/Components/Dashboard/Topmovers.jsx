import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../Context/Dashboardcontext";

const MoverRow = ({ stock, navigate }) => {
  const isUp  = stock.changePercent >= 0;
  const short = stock.symbol.replace(".NS", "");

  return (
    <div
      onClick={() => navigate(`/trade/${stock.symbol}`)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", transition: "background 0.15s ease" }}
      onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#131d30", border: "1px solid #1a2540", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#2d7ef7", flexShrink: 0, fontFamily: "'Poppins', sans-serif" }}>
          {short.slice(0, 3)}
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{stock.name}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
          ₹{stock.currentPrice?.toLocaleString("en-IN")}
        </div>
        <div style={{ fontSize: "12px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d", marginTop: "1px" }}>
          {isUp ? "+" : ""}{stock.changePercent?.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

const TopMovers = () => {
  const navigate             = useNavigate();
  const { topMovers, loading } = useDashboard();

  const gainers = topMovers.filter(s => s.changePercent >= 0).slice(0, 3);
  const losers  = topMovers.filter(s => s.changePercent <  0).slice(0, 3);

  const Card = ({ title, icon, items }) => (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "20px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1,2,3].map(i => <div key={i} style={{ height: "44px", background: "#1a2540", borderRadius: "12px", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: "12px" }}>No data available</div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map(s => <MoverRow key={s.symbol} stock={s} navigate={navigate} />)}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", gap: "16px" }}>
        <Card title="Top Gainers" icon="📈" items={gainers} />
        <Card title="Top Losers"  icon="📉" items={losers}  />
      </div>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </>
  );
};

export default TopMovers;