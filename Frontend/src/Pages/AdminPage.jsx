import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminStats      from "../Components/admin/Adminstats.jsx"
import UserManagement  from "../Components/admin/UserManagement.jsx";
import MarketControls  from "../Components/admin/MarketControls.jsx";
import { LiveTradeFeed, MLJobMonitor } from "../Components/admin/AdminLive.jsx";

/* ── Mock admin stats — replace with API ────────────────── */
const MOCK_STATS = {
  totalUsers:   1240,
  newToday:     24,
  totalTrades:  48291,
  tradesPerHour:312,
  premiumUsers: 387,
  mlJobs:       142,
  mlRunning:    2,
  activeNow:    89,
  haltedStocks: 1,
};

const TABS = [
  { id: "overview",  label: "Overview",        icon: "📊" },
  { id: "users",     label: "Users",           icon: "👥" },
  { id: "markets",   label: "Market Controls", icon: "🎛️" },
  { id: "trades",    label: "Live Trades",     icon: "⚡" },
  { id: "ml",        label: "ML Jobs",         icon: "🤖" },
];

/* ============================================================
   ADMIN PAGE
   ============================================================ */
const AdminPage = () => {
  const navigate   = useNavigate();
  const [tab, setTab] = useState("overview");

  // Replace with real auth check — redirect if not admin
  const isAdmin = true;

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: "100vh", background: "#090e1a", fontFamily: "'Poppins', sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔐</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px" }}>Access Denied</div>
          <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>You need admin privileges to view this page.</div>
          <button onClick={() => navigate("/dashboard")} style={{ background: "#2d7ef7", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: "14px", fontWeight: "600", padding: "10px 24px", cursor: "pointer" }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Page header ──────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>
                Admin Panel
              </h1>
              <span style={{
                fontSize: "10px", fontWeight: "700", padding: "3px 10px",
                borderRadius: "100px", background: "rgba(255,77,109,0.12)",
                color: "#ff4d6d", border: "1px solid rgba(255,77,109,0.25)",
                letterSpacing: "0.08em",
              }}>
                🔐 SUPER ADMIN
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Platform management · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "10px", color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: "600", padding: "8px 16px", cursor: "pointer" }}
            >
              ← User View
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#0e1525", border: "1px solid #1a2540",
              borderRadius: "10px", padding: "8px 14px",
              fontSize: "12px", color: "#64748b",
            }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5a0", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ color: "#00e5a0", fontWeight: "600" }}>System Online</span>
            </div>
          </div>
        </div>

        {/* ── Stats (always visible) ────────────────────────── */}
        <AdminStats stats={MOCK_STATS} />

        {/* ── Tab navigation ───────────────────────────────── */}
        <div style={{
          display:      "flex",
          gap:          "4px",
          background:   "#0e1525",
          border:       "1px solid #1a2540",
          borderRadius: "14px",
          padding:      "5px",
          marginBottom: "20px",
          flexWrap:     "wrap",
        }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex:         "1 1 auto",
                background:   tab === t.id ? "#1a2540" : "transparent",
                border:       "none",
                borderRadius: "10px",
                color:        tab === t.id ? "#e2e8f0" : "#64748b",
                fontFamily:   "'Poppins', sans-serif",
                fontSize:     "13px",
                fontWeight:   "600",
                padding:      "10px 16px",
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                justifyContent:"center",
                gap:          "6px",
                transition:   "all 0.15s",
                whiteSpace:   "nowrap",
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────────────── */}

        {/* Overview tab */}
        {tab === "overview" && (
          <div>
            {/* Two column layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

              {/* Recent activity summary */}
              <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "16px" }}>📈</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Platform Activity</span>
                </div>
                {[
                  { label: "Trades last 24h",   value: "4,821",   color: "#00e5a0" },
                  { label: "New registrations",  value: "24",      color: "#2d7ef7" },
                  { label: "Premium upgrades",   value: "7",       color: "#ffd166" },
                  { label: "ML predictions run", value: "142",     color: "#a78bfa" },
                  { label: "Failed ML jobs",     value: "3",       color: "#ff4d6d" },
                  { label: "Avg session time",   value: "14m 32s", color: "#94a3b8" },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #1a2540" : "none" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{item.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* System health */}
              <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "16px" }}>🖥️</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>System Health</span>
                </div>
                {[
                  { label: "API Server",         status: "online",  uptime: "99.9%"  },
                  { label: "ML Service",         status: "online",  uptime: "98.7%"  },
                  { label: "Market Sync Worker", status: "online",  uptime: "100%"   },
                  { label: "MongoDB",            status: "online",  uptime: "99.9%"  },
                  { label: "BullMQ / Redis",     status: "online",  uptime: "99.8%"  },
                  { label: "Yahoo Finance API",  status: "online",  uptime: "97.2%"  },
                ].map((service, i, arr) => (
                  <div key={service.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #1a2540" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: service.status === "online" ? "#00e5a0" : "#ff4d6d", display: "inline-block" }} />
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{service.label}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#64748b" }}>{service.uptime}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top traders */}
            <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a2540", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>🏆</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Traders This Week</span>
              </div>
              {[
                { rank: 1, name: "Alice Chen",    trades: 312, winRate: 78, pnl: 84200,  role: "premium" },
                { rank: 2, name: "Priya Sharma",  trades: 124, winRate: 71, pnl: 52400,  role: "premium" },
                { rank: 3, name: "Dev Patel",     trades: 89,  winRate: 65, pnl: 31100,  role: "premium" },
                { rank: 4, name: "John Doe",      trades: 48,  winRate: 62, pnl: 14700,  role: "premium" },
                { rank: 5, name: "Rahul Verma",   trades: 21,  winRate: 52, pnl: 6200,   role: "free"    },
              ].map((trader, i, arr) => (
                <div key={trader.rank} style={{ display: "grid", gridTemplateColumns: "40px 2fr 80px 80px 120px 80px", gap: "8px", alignItems: "center", padding: "12px 24px", borderBottom: i < arr.length - 1 ? "1px solid #1a2540" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#131d30"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: "700", color: trader.rank <= 3 ? ["#ffd166","#94a3b8","#cd7f32"][trader.rank-1] : "#374151" }}>
                    #{trader.rank}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{trader.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#64748b" }}>{trader.trades} trades</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: trader.winRate >= 70 ? "#00e5a0" : "#ffd166" }}>{trader.winRate}%</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: "#00e5a0" }}>+₹{trader.pnl.toLocaleString("en-IN")}</span>
                  <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", background: trader.role === "premium" ? "rgba(255,209,102,0.1)" : "rgba(100,116,139,0.1)", color: trader.role === "premium" ? "#ffd166" : "#64748b", border: trader.role === "premium" ? "1px solid rgba(255,209,102,0.2)" : "1px solid rgba(100,116,139,0.15)" }}>
                    {trader.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users"   && <UserManagement />}
        {tab === "markets" && <MarketControls />}
        {tab === "trades"  && <LiveTradeFeed  />}
        {tab === "ml"      && <MLJobMonitor   />}

      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }
      `}</style>
    </div>
  );
};

export default AdminPage;