import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UpgradePage = () => {
  const navigate          = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1800);
  };

  const freeFeatures = [
    { label: "₹1,00,000 virtual balance",      yes: true  },
    { label: "Market & limit orders",           yes: true  },
    { label: "Live order book",                 yes: true  },
    { label: "Portfolio tracking",              yes: true  },
    { label: "Trade history",                   yes: true  },
    { label: "Leaderboard access",              yes: true  },
    { label: "Watchlist",                       yes: false },
    { label: "AI price predictions",            yes: false },
    { label: "Bullish / Bearish trend labels",  yes: false },
    { label: "Confidence score",                yes: false },
    { label: "Actual vs Predicted chart",       yes: false },
    { label: "Priority support",               yes: false },
  ];

  const premiumFeatures = [
    { label: "₹1,00,000 virtual balance",      yes: true  },
    { label: "Market & limit orders",           yes: true  },
    { label: "Live order book",                 yes: true  },
    { label: "Portfolio tracking",              yes: true  },
    { label: "Trade history",                   yes: true  },
    { label: "Leaderboard access",              yes: true  },
    { label: "Watchlist",                       yes: true  },
    { label: "AI price predictions",            yes: true  },
    { label: "Bullish / Bearish trend labels",  yes: true  },
    { label: "Confidence score",                yes: true  },
    { label: "Actual vs Predicted chart",       yes: true  },
    { label: "Priority support",               yes: true  },
  ];

  const mlHighlights = [
    { icon: "📈", title: "Next-Day Price",      desc: "Predicted closing price for tomorrow"     },
    { icon: "🎯", title: "Trend Direction",     desc: "Bullish, Bearish, or Neutral signal"      },
    { icon: "💯", title: "Confidence Score",    desc: "40–95% confidence on every prediction"   },
    { icon: "📊", title: "Actual vs Predicted", desc: "Visual chart comparing history vs AI"     },
    { icon: "🧠", title: "Real ML Model",       desc: "Random Forest trained on OHLCV data"      },
    { icon: "⚡", title: "Instant Results",     desc: "Background job delivers in seconds"       },
  ];

  if (done) {
    return (
      <div style={{ ...s.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={s.successBox}>
          <div style={s.successEmoji}>⭐</div>
          <h2 style={s.successTitle}>Welcome to Premium!</h2>
          <p style={s.successText}>
            Your account has been upgraded. You now have access to AI predictions,
            Watchlist, and all Premium features.
          </p>
          <div style={s.successBtns}>
            <button onClick={() => navigate("/predictions")} style={s.successPrimary}>
              Try AI Predictions →
            </button>
            <button onClick={() => navigate("/dashboard")} style={s.successGhost}>
              Go to Dashboard
            </button>
          </div>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.gridBg} />
      <div style={{ ...s.orb, top: "-120px", left: "-80px",  background: "rgba(167,139,250,0.1)"  }} />
      <div style={{ ...s.orb, bottom: "-80px", right: "-80px", background: "rgba(45,126,247,0.08)", width: "350px", height: "350px" }} />

      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <span style={s.badge}>⭐ Upgrade to Premium</span>
          <h1 style={s.title}>
            Unlock the full power of<br />
            <span style={s.titleAccent}>TradeSphere AI</span>
          </h1>
          <p style={s.subtitle}>
            Get AI-powered price predictions, Watchlist, and exclusive insights —
            all still using virtual money.
          </p>
        </div>

        {/* Pricing cards */}
        <div style={s.pricingRow}>

          {/* Free card */}
          <div style={s.freeCard}>
            <div style={s.planTag}>Current Plan</div>
            <div style={s.planIcon}>👤</div>
            <h2 style={s.planName}>Free</h2>
            <div style={s.planPrice}>₹0 <span style={s.planPer}>forever</span></div>
            <p style={s.planDesc}>Everything you need to start trading virtually.</p>
            <div style={s.featureList}>
              {freeFeatures.map((f, i) => (
                <div key={i} style={s.featureRow}>
                  <span style={{ ...s.featureCheck, color: f.yes ? "#00e5a0" : "#374151" }}>
                    {f.yes ? "✓" : "✗"}
                  </span>
                  <span style={{ ...s.featureLabel, color: f.yes ? "#e2e8f0" : "#374151" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
            <button style={s.currentBtn} disabled>Current Plan</button>
          </div>

          {/* Premium card */}
          <div style={s.premiumCard}>
            <div style={s.popularTag}>⭐ Recommended</div>
            <div style={s.planIconPremium}>🚀</div>
            <h2 style={{ ...s.planName, color: "#a78bfa" }}>Premium</h2>
            <div style={{ ...s.planPrice, color: "#a78bfa" }}>
              Free*
              <span style={s.planPer}> (virtual platform)</span>
            </div>
            <p style={s.planDesc}>Unlock AI predictions and full trading features.</p>
            <div style={s.featureList}>
              {premiumFeatures.map((f, i) => (
                <div key={i} style={s.featureRow}>
                  <span style={{ ...s.featureCheck, color: "#00e5a0" }}>✓</span>
                  <span style={{ ...s.featureLabel, color: "#e2e8f0" }}>
                    {f.label}
                    {!freeFeatures[i].yes && (
                      <span style={s.newTag}>NEW</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{ ...s.upgradeBtn, opacity: loading ? 0.75 : 1 }}
            >
              {loading
                ? <span style={s.spinner} />
                : "Upgrade Now — It's Free →"
              }
            </button>
            <p style={s.disclaimer}>*TradeSphere is a simulation platform. No real money is involved.</p>
          </div>
        </div>

        {/* ML Highlights */}
        <div style={s.mlSection}>
          <div style={s.mlBadge}>🤖 What you unlock</div>
          <h2 style={s.mlTitle}>AI Prediction Engine</h2>
          <p style={s.mlSub}>
            Our Flask ML microservice trains on real OHLCV data from Alpha Vantage,
            using financial features like RSI-14, Bollinger Bands, and price momentum
            to predict next-day closing prices.
          </p>
          <div style={s.mlGrid}>
            {mlHighlights.map((m) => (
              <div key={m.title} style={s.mlCard}>
                <span style={s.mlIcon}>{m.icon}</span>
                <div style={s.mlCardTitle}>{m.title}</div>
                <div style={s.mlCardDesc}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={s.bottomCta}>
          <h2 style={s.ctaTitle}>Ready to trade smarter?</h2>
          <button onClick={handleUpgrade} style={s.ctaBtn} disabled={loading}>
            {loading ? <span style={s.spinner} /> : "⭐ Upgrade to Premium — Free"}
          </button>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
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
  container: { maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 },

  header: { textAlign: "center", marginBottom: "60px" },
  badge: {
    display: "inline-block",
    background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)",
    borderRadius: "100px", color: "#a78bfa",
    fontSize: "12px", fontWeight: "600", padding: "5px 16px",
    letterSpacing: "0.06em", marginBottom: "20px",
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800",
    color: "#e2e8f0", letterSpacing: "-0.03em",
    lineHeight: "1.15", marginBottom: "16px",
  },
  titleAccent: {
    background: "linear-gradient(90deg, #a78bfa, #2d7ef7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  subtitle: { color: "#64748b", fontSize: "16px", maxWidth: "520px", margin: "0 auto", lineHeight: "1.75" },

  /* Pricing */
  pricingRow: { display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "20px", marginBottom: "80px" },

  freeCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "20px", padding: "32px",
    display: "flex", flexDirection: "column", gap: "0",
    position: "relative",
  },
  premiumCard: {
    background: "linear-gradient(145deg, #0e1525, #13192e)",
    border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: "20px", padding: "32px",
    display: "flex", flexDirection: "column",
    position: "relative",
    boxShadow: "0 0 40px rgba(167,139,250,0.1)",
  },

  planTag: {
    position: "absolute", top: "16px", right: "16px",
    background: "rgba(100,116,139,0.12)", border: "1px solid #1a2540",
    borderRadius: "100px", color: "#64748b",
    fontSize: "11px", fontWeight: "600", padding: "3px 10px",
  },
  popularTag: {
    position: "absolute", top: "16px", right: "16px",
    background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: "100px", color: "#a78bfa",
    fontSize: "11px", fontWeight: "600", padding: "3px 10px",
  },

  planIcon:        { fontSize: "36px", marginBottom: "12px" },
  planIconPremium: { fontSize: "36px", marginBottom: "12px" },
  planName:  { fontSize: "22px", fontWeight: "700", color: "#e2e8f0", marginBottom: "4px" },
  planPrice: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "28px", fontWeight: "700", color: "#e2e8f0",
    marginBottom: "8px",
  },
  planPer:   { fontSize: "14px", fontWeight: "400", color: "#64748b" },
  planDesc:  { fontSize: "13px", color: "#64748b", marginBottom: "24px", lineHeight: "1.6" },

  featureList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", flex: 1 },
  featureRow:  { display: "flex", alignItems: "center", gap: "10px" },
  featureCheck: { fontSize: "14px", fontWeight: "700", flexShrink: 0, width: "16px" },
  featureLabel: { fontSize: "13.5px" },
  newTag: {
    background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.25)",
    borderRadius: "4px", color: "#00e5a0",
    fontSize: "9px", fontWeight: "700", padding: "1px 6px",
    marginLeft: "6px", verticalAlign: "middle",
    letterSpacing: "0.06em",
  },

  currentBtn: {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid #1a2540", borderRadius: "10px",
    color: "#64748b", fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", fontWeight: "500", padding: "12px",
    cursor: "not-allowed",
  },
  upgradeBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #a78bfa, #2d7ef7)",
    border: "none", borderRadius: "10px",
    color: "#fff", fontFamily: "'Poppins', sans-serif",
    fontSize: "15px", fontWeight: "700", padding: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 24px rgba(167,139,250,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  disclaimer: { fontSize: "11px", color: "#374151", textAlign: "center", marginTop: "10px" },

  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff", borderRadius: "50%",
    display: "inline-block", animation: "spin 0.7s linear infinite",
  },

  /* ML section */
  mlSection: { marginBottom: "80px", textAlign: "center" },
  mlBadge: {
    display: "inline-block",
    background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
    borderRadius: "100px", color: "#a78bfa",
    fontSize: "12px", fontWeight: "600", padding: "4px 14px",
    marginBottom: "16px",
  },
  mlTitle: {
    fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "700",
    color: "#e2e8f0", letterSpacing: "-0.02em", marginBottom: "12px",
  },
  mlSub: { color: "#64748b", fontSize: "14px", maxWidth: "580px", margin: "0 auto 40px", lineHeight: "1.75" },
  mlGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  mlCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "14px", padding: "22px", textAlign: "left",
  },
  mlIcon:     { fontSize: "28px", display: "block", marginBottom: "12px" },
  mlCardTitle:{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" },
  mlCardDesc: { fontSize: "12.5px", color: "#64748b", lineHeight: "1.6" },

  /* Bottom CTA */
  bottomCta: {
    textAlign: "center",
    background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(45,126,247,0.05))",
    border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: "20px", padding: "48px",
  },
  ctaTitle: { fontSize: "1.8rem", fontWeight: "800", color: "#e2e8f0", marginBottom: "24px", letterSpacing: "-0.02em" },
  ctaBtn: {
    background: "linear-gradient(135deg, #a78bfa, #2d7ef7)",
    border: "none", borderRadius: "12px",
    color: "#fff", fontFamily: "'Poppins', sans-serif",
    fontSize: "16px", fontWeight: "700", padding: "15px 36px",
    cursor: "pointer", boxShadow: "0 4px 24px rgba(167,139,250,0.35)",
    display: "inline-flex", alignItems: "center", gap: "8px",
    transition: "all 0.2s",
  },

  /* Success screen */
  successBox: {
    background: "#0e1525", border: "1px solid rgba(167,139,250,0.35)",
    borderRadius: "24px", padding: "64px 48px",
    textAlign: "center", maxWidth: "480px",
    boxShadow: "0 0 60px rgba(167,139,250,0.15)",
    animation: "fadeIn 0.4s ease both",
  },
  successEmoji: { fontSize: "64px", marginBottom: "20px" },
  successTitle: { fontSize: "26px", fontWeight: "800", color: "#e2e8f0", marginBottom: "12px", letterSpacing: "-0.02em" },
  successText:  { fontSize: "14px", color: "#64748b", lineHeight: "1.75", marginBottom: "32px" },
  successBtns:  { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  successPrimary: {
    background: "linear-gradient(135deg, #a78bfa, #2d7ef7)",
    border: "none", borderRadius: "10px",
    color: "#fff", fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", fontWeight: "600", padding: "12px 24px", cursor: "pointer",
  },
  successGhost: {
    background: "transparent", border: "1px solid #1a2540",
    borderRadius: "10px", color: "#94a3b8",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", fontWeight: "500", padding: "12px 24px", cursor: "pointer",
  },
};

export default UpgradePage;