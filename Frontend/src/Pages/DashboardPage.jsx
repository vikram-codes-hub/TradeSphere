import { useState, useEffect }    from "react";
import { DashboardProvider, useDashboard } from "../Context/DashboardContext";
import { useAuth }                from "../Context/AuthContext";
import StatCard                   from "../Components/Dashboard/Statcard.jsx";
import PortfolioChart             from "../Components/Dashboard/Portfoliochart.jsx";
import TopMovers                  from "../Components/Dashboard/Topmovers.jsx";
import HoldingsPreview            from "../Components/Dashboard/Holdingspreview.jsx";
import RecentTrades               from "../Components/Dashboard/Recenttrades.jsx";
import WatchlistPreview           from "../Components/Dashboard/Watchlistpreview.jsx";
import PredictionHighlights       from "../Components/Dashboard/Predictionhighlights.jsx";

/* ============================================================
   INNER LAYOUT — uses useDashboard()
   ============================================================ */
const DashboardLayout = () => {
  const { user }                        = useAuth();
  const { summary, loading, error, refresh, lastUpdated } = useDashboard();
  const [time, setTime]                 = useState(new Date());

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

  // ── Build stat cards from real summary ────────────────
  const STAT_CARDS = [
    {
      title:     "Total Balance",
      value:     summary ? `₹${summary.netWorth?.toLocaleString("en-IN")}` : "—",
      sub:       summary ? `${summary.totalPnlPct >= 0 ? "+" : ""}${summary.totalPnlPct?.toFixed(2)}%` : "",
      icon:      "💰",
      trend:     summary?.totalPnlPct >= 0 ? "up" : "down",
      sparkline: null,
    },
    {
      title:     "Today's P&L",
      value:     summary ? `${summary.todayPnl >= 0 ? "+" : ""}₹${Math.abs(summary.todayPnl)?.toLocaleString("en-IN")}` : "—",
      sub:       summary ? `${summary.todayPnlPct >= 0 ? "+" : ""}${summary.todayPnlPct?.toFixed(2)}% today` : "",
      icon:      "📈",
      trend:     summary?.todayPnl >= 0 ? "up" : "down",
      sparkline: null,
    },
    {
      title:     "Holdings",
      value:     summary ? `${summary.totalHoldings} Stocks` : "—",
      sub:       summary ? `₹${summary.investedValue?.toLocaleString("en-IN")} invested` : "",
      icon:      "💼",
      trend:     null,
      sparkline: null,
    },
    {
      title:     "Win Rate",
      value:     summary ? `${summary.winRate}%` : "—",
      sub:       summary ? `${summary.totalTrades} trades` : "",
      icon:      "🎯",
      trend:     summary?.winRate >= 50 ? "up" : "down",
      sparkline: null,
    },
  ];

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
              {greeting()}, {user?.name} 👋
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              {lastUpdated && (
                <span style={{ marginLeft: "12px", color: "#334155" }}>
                  · Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Clock */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#64748b", background: "#0e1525", border: "1px solid #1a2540", borderRadius: "10px", padding: "8px 14px" }}>
              {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            {/* Live */}
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#0e1525", border: "1px solid #1a2540", borderRadius: "10px", padding: "8px 14px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5a0", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#00e5a0" }}>LIVE</span>
            </div>

            {/* Market open */}
            <div style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: "700", color: "#00e5a0" }}>
              Market Open
            </div>

            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading}
              style={{ background: "rgba(45,126,247,0.08)", border: "1px solid rgba(45,126,247,0.2)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: "600", color: "#2d7ef7", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "⟳ Loading..." : "⟳ Refresh"}
            </button>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────── */}
        {error && (
          <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#ff4d6d" }}>
            ⚠️ {error} — <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={refresh}>Retry</span>
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
          {STAT_CARDS.map((card) => (
            <StatCard key={card.title} {...card} loading={loading} />
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
        <PredictionHighlights isPremium={user?.role === "premium" || user?.role === "admin"} />

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
        @media (max-width: 900px) {
          .dash-stats  { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-bottom { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .dash-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* ============================================================
   OUTER WRAPPER — provides DashboardContext
   ============================================================ */
const DashboardPage = () => (
  <DashboardProvider>
    <DashboardLayout />
  </DashboardProvider>
);

export default DashboardPage;