import { useNavigate } from "react-router-dom";
import { useAuth }     from "../Context/AuthContext";

const Home = () => {
  const navigate      = useNavigate();
  const { user, isPremium } = useAuth();

  const quickLinks = [
    {
      icon:    "📊",
      label:   "Markets",
      desc:    "Live stock prices, NSE & NASDAQ",
      path:    "/market",
      color:   "#2d7ef7",
      always:  true,
    },
    {
      icon:    "🗂️",
      label:   "Dashboard",
      desc:    "Your portfolio overview & stats",
      path:    "/dashboard",
      color:   "#00e5a0",
      always:  true,
    },
    {
      icon:    "💼",
      label:   "Portfolio",
      desc:    "Holdings, P&L and trade history",
      path:    "/portfolio",
      color:   "#a78bfa",
      always:  true,
    },
    {
      icon:    "🏆",
      label:   "Leaderboard",
      desc:    "Top traders ranked by P&L",
      path:    "/leaderboard",
      color:   "#ffd166",
      always:  true,
    },
    {
      icon:    "🤖",
      label:   "AI Predictions",
      desc:    "Next-day price forecasts",
      path:    "/predictions",
      color:   "#a78bfa",
      premium: true,
    },
    {
      icon:    "⭐",
      label:   "Watchlist",
      desc:    "Track your favourite stocks",
      path:    "/watchlist",
      color:   "#ffd166",
      premium: true,
    },
  ];

  const visibleLinks = user
    ? quickLinks.filter(l => l.always || isPremium || user?.role === "admin")
    : quickLinks.filter(l => l.always);

  return (
    <div style={{
      minHeight:   "100vh",
      background:  "#090e1a",
      fontFamily:  "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(45,126,247,0.03) 1px,transparent 1px)",
      backgroundSize: "48px 48px",
      display:     "flex",
      flexDirection:"column",
      alignItems:  "center",
      justifyContent:"center",
      padding:     "60px 24px",
    }}>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "56px", maxWidth: "600px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: "100px", padding: "5px 14px", marginBottom: "24px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5a0", display: "inline-block", boxShadow: "0 0 8px #00e5a0", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#00e5a0", letterSpacing: "0.1em" }}>LIVE MARKETS</span>
        </div>

        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.03em", lineHeight: "1.15", marginBottom: "16px" }}>
          Welcome to{" "}
          <span style={{ background: "linear-gradient(90deg,#2d7ef7,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            TradeSphere
          </span>
        </h1>

        <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.75", marginBottom: "0" }}>
          Virtual stock trading with real market data. Practice trading Indian & US stocks risk-free.
        </p>

        {!user && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/auth/signup")}
              style={{ background: "#2d7ef7", border: "none", borderRadius: "12px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: "15px", fontWeight: "700", padding: "13px 28px", cursor: "pointer", boxShadow: "0 4px 24px rgba(45,126,247,0.35)" }}>
              Get Started Free →
            </button>
            <button onClick={() => navigate("/auth/login")}
              style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "12px", color: "#94a3b8", fontFamily: "'Poppins',sans-serif", fontSize: "15px", fontWeight: "600", padding: "13px 28px", cursor: "pointer" }}>
              Login
            </button>
          </div>
        )}
      </div>

      {/* Quick nav cards */}
      {user && (
        <>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
            Where do you want to go?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px", width: "100%", maxWidth: "860px" }}>
            {visibleLinks.map(link => (
              <button key={link.path} onClick={() => navigate(link.path)}
                style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Poppins',sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = link.color + "50"; e.currentTarget.style.background = "#131d30"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.background = "#0e1525"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{link.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "4px" }}>{link.label}</div>
                <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>{link.desc}</div>
                <div style={{ marginTop: "14px", fontSize: "12px", fontWeight: "600", color: link.color }}>Go → </div>
              </button>
            ))}
          </div>

          {/* Upgrade nudge for free users */}
          {!isPremium && user?.role !== "admin" && (
            <div style={{ marginTop: "32px", background: "linear-gradient(135deg,rgba(167,139,250,0.08),rgba(45,126,247,0.06))", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "14px", padding: "18px 24px", maxWidth: "860px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0", marginBottom: "3px" }}>⭐ Unlock AI Predictions & Watchlist</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Upgrade to Premium — it's free on TradeSphere</div>
              </div>
              <button onClick={() => navigate("/upgrade")}
                style={{ background: "linear-gradient(135deg,#a78bfa,#2d7ef7)", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: "700", padding: "10px 22px", cursor: "pointer", whiteSpace: "nowrap" }}>
                Upgrade Free →
              </button>
            </div>
          )}
        </>
      )}

      {/* Guest quick links */}
      {!user && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px", width: "100%", maxWidth: "680px" }}>
          {[
            { icon: "📊", label: "Browse Markets", desc: "See live stock prices", path: "/market",      color: "#2d7ef7" },
            { icon: "🏆", label: "Leaderboard",    desc: "Top traders ranked",   path: "/leaderboard",  color: "#ffd166" },
          ].map(link => (
            <button key={link.path} onClick={() => navigate(link.path)}
              style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Poppins',sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = link.color + "50"; e.currentTarget.style.background = "#131d30"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.background = "#0e1525"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{link.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "4px" }}>{link.label}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{link.desc}</div>
              <div style={{ marginTop: "14px", fontSize: "12px", fontWeight: "600", color: link.color }}>Go →</div>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }
      `}</style>
    </div>
  );
};

export default Home;