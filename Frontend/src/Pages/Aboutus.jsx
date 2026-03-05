import React from "react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  const values = [
    { icon: "⚡", title: "Real Engineering",    color: "#2d7ef7", desc: "Built with a real matching engine, Redis order book, and BullMQ workers — not a CRUD app." },
    { icon: "🔍", title: "Transparent System",  color: "#00e5a0", desc: "Every trade, every price change, every ML prediction is traceable and explainable." },
    { icon: "🤖", title: "AI-First Thinking",   color: "#a78bfa", desc: "Machine learning is not an afterthought. It's a core feature with real financial features." },
    { icon: "📚", title: "Built to Learn",      color: "#ffd166", desc: "TradeSphere was designed to teach real financial system concepts through hands-on simulation." },
  ];

  const team = [
    { name: "Matching Engine",   role: "Core Backend",       icon: "⚙️",  color: "#2d7ef7", detail: "Node.js + Redis sorted sets" },
    { name: "ML Microservice",   role: "AI Predictions",     icon: "🤖",  color: "#a78bfa", detail: "Python + Flask + scikit-learn" },
    { name: "Real-Time Layer",   role: "Live Updates",       icon: "⚡",  color: "#00e5a0", detail: "Socket.IO + BullMQ workers"  },
    { name: "React Frontend",    role: "User Interface",     icon: "🖥️",  color: "#ffd166", detail: "React + Tailwind + Chart.js"  },
  ];

  const stats = [
    { value: "3",        label: "Microservices"      },
    { value: "11",       label: "Core Features"      },
    { value: "6",        label: "ML Features (RSI…)" },
    { value: "₹1L",      label: "Starting Balance"   },
  ];

  return (
    <div style={s.root}>
      <div style={s.gridBg} />
      <div style={{ ...s.orb, top: "-100px", right: "-100px", background: "rgba(167,139,250,0.08)" }} />

      <div style={s.container}>

        {/* Hero */}
        <div style={s.hero}>
          <span style={s.badge}>🏦 About TradeSphere</span>
          <h1 style={s.heroTitle}>
            A mini financial system.<br />
            <span style={s.heroAccent}>Not a tutorial project.</span>
          </h1>
          <p style={s.heroSub}>
            TradeSphere is a full-stack stock exchange simulator built to demonstrate
            production-level engineering concepts — order matching, real-time WebSockets,
            background job queues, and ML-powered predictions — all working together.
          </p>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {stats.map((st) => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statValue}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div style={s.section}>
          <div style={s.sectionBadge}>📖 The Story</div>
          <div style={s.storyGrid}>
            <div>
              <h2 style={s.sectionTitle}>Why we built this</h2>
              <p style={s.storyText}>
                Most trading apps you see in portfolios are simple CRUD apps — place order, save to database, done.
                TradeSphere was built to be different.
              </p>
              <p style={s.storyText}>
                Real stock exchanges are fascinating engineering systems. Orders need to be matched in microseconds.
                Prices need to update for every connected user simultaneously. Heavy ML jobs can't block the API.
                These are the kinds of problems TradeSphere was designed to simulate.
              </p>
              <p style={s.storyText}>
                Built as a learning project that demonstrates system design thinking — the kind of thinking
                that separates junior developers from engineers who understand how production systems actually work.
              </p>
            </div>
            <div style={s.storyVisual}>
              <div style={s.archBox}>
                {["React Frontend", "Node.js API", "Redis Order Book", "Flask ML Service", "MongoDB", "BullMQ Workers"].map((item, i) => (
                  <div key={item} style={{
                    ...s.archItem,
                    animationDelay: `${i * 0.1}s`,
                    borderColor: ["#2d7ef7","#00e5a0","#ffd166","#a78bfa","#ff4d6d","#ff8c42"][i] + "44",
                    color:        ["#2d7ef7","#00e5a0","#ffd166","#a78bfa","#ff4d6d","#ff8c42"][i],
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div style={s.section}>
          <div style={s.sectionBadge}>💡 Core Values</div>
          <h2 style={s.sectionTitle}>What TradeSphere stands for</h2>
          <div style={s.valuesGrid}>
            {values.map((v) => (
              <div key={v.title} style={{ ...s.valueCard, borderColor: v.color + "33" }}>
                <div style={{ ...s.valueIcon, background: v.color + "18", border: `1px solid ${v.color}44` }}>
                  {v.icon}
                </div>
                <h3 style={{ ...s.valueTitle, color: v.color }}>{v.title}</h3>
                <p style={s.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech */}
        <div style={s.section}>
          <div style={s.sectionBadge}>🛠️ The Tech</div>
          <h2 style={s.sectionTitle}>What's powering TradeSphere</h2>
          <div style={s.teamGrid}>
            {team.map((t) => (
              <div key={t.name} style={s.teamCard}>
                <div style={{ ...s.teamIcon, background: t.color + "18", border: `1px solid ${t.color}33` }}>
                  {t.icon}
                </div>
                <div style={{ ...s.teamName, color: t.color }}>{t.name}</div>
                <div style={s.teamRole}>{t.role}</div>
                <div style={s.teamDetail}>{t.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={s.cta}>
          <h2 style={s.ctaTitle}>Start trading today</h2>
          <p style={s.ctaSub}>₹1,00,000 virtual cash. No real money. Real mechanics.</p>
          <div style={s.ctaBtns}>
            <button onClick={() => navigate("/auth/signup")} style={s.ctaPrimary}>
              Create Free Account →
            </button>
            <button onClick={() => navigate("/how-it-works")} style={s.ctaGhost}>
              How It Works
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

const s = {
  root: {
    minHeight: "100vh", background: "#090e1a",
    fontFamily: "'Poppins', sans-serif",
    position: "relative", overflow: "hidden",
    padding: "60px 24px 80px",
  },
  gridBg: {
    position: "absolute", inset: 0,
    backgroundImage:
      "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px)," +
      "linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px", pointerEvents: "none",
  },
  orb: {
    position: "absolute", borderRadius: "50%",
    filter: "blur(80px)", pointerEvents: "none",
    width: "500px", height: "500px",
  },
  container: { maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 },

  hero: { textAlign: "center", marginBottom: "60px" },
  badge: {
    display: "inline-block",
    background: "rgba(45,126,247,0.12)", border: "1px solid rgba(45,126,247,0.25)",
    borderRadius: "100px", color: "#2d7ef7",
    fontSize: "12px", fontWeight: "600", padding: "5px 16px",
    letterSpacing: "0.06em", marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800",
    color: "#e2e8f0", letterSpacing: "-0.03em",
    lineHeight: "1.15", marginBottom: "16px",
  },
  heroAccent: {
    background: "linear-gradient(90deg, #a78bfa, #2d7ef7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  heroSub: {
    color: "#64748b", fontSize: "16px",
    maxWidth: "600px", margin: "0 auto", lineHeight: "1.75",
  },

  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px", marginBottom: "80px",
  },
  statCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "16px", padding: "24px",
    textAlign: "center",
  },
  statValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "32px", fontWeight: "700", color: "#2d7ef7",
    marginBottom: "6px",
  },
  statLabel: { fontSize: "12px", color: "#64748b", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em" },

  section: { marginBottom: "80px" },
  sectionBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.04)", border: "1px solid #1a2540",
    borderRadius: "100px", color: "#64748b",
    fontSize: "12px", fontWeight: "600", padding: "4px 14px",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "700",
    color: "#e2e8f0", letterSpacing: "-0.02em", marginBottom: "32px",
  },

  storyGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" },
  storyText: { color: "#94a3b8", lineHeight: "1.8", marginBottom: "16px", fontSize: "15px" },

  storyVisual: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "20px", padding: "28px",
  },
  archBox: { display: "flex", flexDirection: "column", gap: "10px" },
  archItem: {
    background: "rgba(255,255,255,0.02)", border: "1px solid",
    borderRadius: "10px", padding: "12px 16px",
    fontSize: "13px", fontWeight: "600",
    fontFamily: "'JetBrains Mono', monospace",
  },

  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" },
  valueCard: {
    background: "#0e1525", border: "1px solid",
    borderRadius: "16px", padding: "28px",
    transition: "transform 0.2s",
  },
  valueIcon: {
    width: "48px", height: "48px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "22px", marginBottom: "16px",
  },
  valueTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "8px" },
  valueDesc:  { fontSize: "13.5px", color: "#64748b", lineHeight: "1.7" },

  teamGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  teamCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "16px", padding: "24px", textAlign: "center",
  },
  teamIcon: {
    width: "56px", height: "56px", borderRadius: "16px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "26px", margin: "0 auto 14px",
  },
  teamName:   { fontSize: "14px", fontWeight: "700", marginBottom: "4px" },
  teamRole:   { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" },
  teamDetail: { fontSize: "12px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" },

  cta: {
    textAlign: "center",
    background: "linear-gradient(135deg, rgba(45,126,247,0.08), rgba(167,139,250,0.05))",
    border: "1px solid rgba(45,126,247,0.2)", borderRadius: "24px", padding: "60px 40px",
  },
  ctaTitle: { fontSize: "2rem", fontWeight: "800", color: "#e2e8f0", marginBottom: "12px", letterSpacing: "-0.02em" },
  ctaSub:   { color: "#64748b", fontSize: "15px", marginBottom: "32px" },
  ctaBtns:  { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  ctaPrimary: {
    background: "#2d7ef7", border: "none", borderRadius: "10px",
    color: "#fff", fontFamily: "'Poppins', sans-serif",
    fontSize: "15px", fontWeight: "600", padding: "13px 28px",
    cursor: "pointer", boxShadow: "0 4px 20px rgba(45,126,247,0.35)",
  },
  ctaGhost: {
    background: "transparent", border: "1px solid #1a2540",
    borderRadius: "10px", color: "#94a3b8",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "15px", fontWeight: "500", padding: "13px 28px", cursor: "pointer",
  },
};

export default AboutUs;