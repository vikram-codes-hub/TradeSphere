import { useState, useEffect }    from "react";
import StatCard                   from "../Components/Dashboard/Statcard.jsx"
import PortfolioChart             from "../Components/Dashboard/PortfolioChart.jsx";
import TopMovers                  from "../Components/Dashboard/Topmovers.jsx";
import HoldingsPreview            from "../Components/Dashboard/Holdingspreview.jsx";
import RecentTrades               from "../Components/Dashboard/Recenttrades.jsx"
import WatchlistPreview           from "../Components/Dashboard/WatchlistPreview.jsx";
import PredictionHighlights       from "../Components/Dashboard/Predictionhighlights.jsx"

const MOCK_USER = { name: "John", role: "premium" };

const STAT_CARDS = [
  { title: "Total Balance",  value: "₹1,12,430", sub: "+12.4%",       icon: "💰", trend: "up",   sparkline: [98200,99500,97800,101200,103400,108900,112430] },
  { title: "Today's P&L",   value: "+₹2,430",   sub: "+2.2% today",  icon: "📈", trend: "up",   sparkline: [400,800,300,1200,900,1800,2430]                },
  { title: "Holdings",       value: "8 Stocks",  sub: "₹68,200 invested", icon: "💼", trend: null, sparkline: null },
  { title: "Win Rate",       value: "62%",       sub: "48 trades",    icon: "🎯", trend: "up",   sparkline: [50,55,48,60,57,63,62]                         },
];

const Dashboard = () => {
  const user        = MOCK_USER;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Greeting bar ─────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>
              {greeting()}, {user.name} 👋
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Clock */}
            <div style={{
              fontFamily:   "'JetBrains Mono', monospace",
              fontSize:     "13px",
              color:        "#64748b",
              background:   "#0e1525",
              border:       "1px solid #1a2540",
              borderRadius: "10px",
              padding:      "8px 14px",
            }}>
              {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            {/* Live */}
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "7px",
              background:   "#0e1525",
              border:       "1px solid #1a2540",
              borderRadius: "10px",
              padding:      "8px 14px",
            }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5a0", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#00e5a0" }}>LIVE</span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>15 stocks</span>
            </div>

            {/* Market open */}
            <div style={{
              background:   "rgba(0,229,160,0.08)",
              border:       "1px solid rgba(0,229,160,0.2)",
              borderRadius: "10px",
              padding:      "8px 14px",
              fontSize:     "12px",
              fontWeight:   "700",
              color:        "#00e5a0",
            }}>
              Market Open
            </div>
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
          {STAT_CARDS.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* ── Portfolio chart ──────────────────────────────── */}
        <div style={{ marginBottom: "20px" }}>
          <PortfolioChart />
        </div>

        {/* ── Top movers ───────────────────────────────────── */}
        <div style={{ marginBottom: "20px" }}>
          <TopMovers />
        </div>

        {/* ── Holdings ─────────────────────────────────────── */}
        <div style={{ marginBottom: "20px" }}>
          <HoldingsPreview />
        </div>

        {/* ── Recent Trades + Watchlist ────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <RecentTrades />
          <WatchlistPreview />
        </div>

        {/* ── AI Predictions ───────────────────────────────── */}
        <PredictionHighlights isPremium={user.role === "premium"} />

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;