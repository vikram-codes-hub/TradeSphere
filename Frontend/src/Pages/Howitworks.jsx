import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      icon: "🔐",
      title: "Create Your Account",
      subtitle: "Get started in 30 seconds",
      color: "#2d7ef7",
      description:
        "Register with your email and get ₹1,00,000 in virtual cash instantly. No real money needed. Choose between a Free account or upgrade to Premium for AI-powered predictions.",
      details: [
        "Instant account creation",
        "₹1,00,000 virtual starting balance",
        "Free or Premium account options",
        "Secure JWT-based authentication",
      ],
    },
    {
      number: "02",
      icon: "📊",
      title: "Explore the Markets",
      subtitle: "Live prices, real mechanics",
      color: "#00e5a0",
      description:
        "Browse all available stocks with real-time price updates powered by Socket.IO. Watch prices move every 5 seconds based on our market simulation engine. Save stocks to your Watchlist.",
      details: [
        "Live price updates every 5 seconds",
        "Volume, market cap & price history",
        "Watchlist to track favourite stocks",
        "Candlestick charts for each stock",
      ],
    },
    {
      number: "03",
      icon: "⚡",
      title: "Place Your Orders",
      subtitle: "Market & limit orders",
      color: "#ffd166",
      description:
        "Place Market Orders for instant execution at the best available price, or Limit Orders that wait in the order book until your target price is hit. Watch your order get matched live.",
      details: [
        "Market orders — instant execution",
        "Limit orders — custom price target",
        "Live order book (bid/ask)",
        "Partial fills supported",
      ],
    },
    {
      number: "04",
      icon: "🔧",
      title: "Matching Engine Executes",
      subtitle: "The heart of TradeSphere",
      color: "#a78bfa",
      description:
        "When your buy price meets a sell price, our matching engine executes the trade instantly. Both portfolios update, the stock price adjusts, and everyone watching gets a live WebSocket notification.",
      details: [
        "O(log n) Redis order book",
        "Instant portfolio updates",
        "Live trade feed broadcast",
        "Circuit breaker on 10% swings",
      ],
    },
    {
      number: "05",
      icon: "🤖",
      title: "Get AI Predictions",
      subtitle: "Premium feature",
      color: "#ff8c42",
      description:
        "Premium users can request next-day price predictions powered by our Flask ML microservice. The model trains on real OHLCV data and uses RSI, Bollinger Bands, and momentum features to forecast prices.",
      details: [
        "Random Forest + Linear Regression",
        "Bullish / Bearish / Neutral trend",
        "Confidence score (40–95%)",
        "Actual vs Predicted graph",
      ],
    },
    {
      number: "06",
      icon: "🏆",
      title: "Climb the Leaderboard",
      subtitle: "Compete with traders",
      color: "#ff4d6d",
      description:
        "Every trade you make counts toward your rank. The leaderboard recalculates every 60 seconds via background jobs. Compete weekly or all-time based on total profit and win rate.",
      details: [
        "Ranked by total profit",
        "Win rate percentage tracked",
        "Weekly & all-time rankings",
        "Updated every 60 seconds",
      ],
    },
  ];

  return (
    <div style={s.root}>
      <div style={s.gridBg} />
      <div style={{ ...s.orb, top: "-100px", left: "-100px", background: "rgba(45,126,247,0.1)" }} />
      <div style={{ ...s.orb, bottom: "-100px", right: "-100px", background: "rgba(0,229,160,0.07)", width: "400px", height: "400px" }} />

      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <span style={s.badge}>📖 How It Works</span>
          <h1 style={s.title}>
            From signup to<br />
            <span style={s.titleAccent}>your first trade</span>
          </h1>
          <p style={s.subtitle}>
            TradeSphere simulates a real stock exchange. Here's exactly how everything works under the hood.
          </p>
        </div>

        {/* Steps */}
        <div style={s.stepsLayout}>

          {/* Left — step list */}
          <div style={s.stepList}>
            {steps.map((step, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  ...s.stepItem,
                  borderColor: activeStep === i ? step.color : "#1a2540",
                  background:  activeStep === i ? `rgba(${hexToRgb(step.color)}, 0.06)` : "transparent",
                }}
              >
                <div style={{
                  ...s.stepNumber,
                  background: activeStep === i ? step.color : "#1a2540",
                  color:      activeStep === i ? "#fff" : "#64748b",
                }}>
                  {step.number}
                </div>
                <div>
                  <div style={{
                    ...s.stepTitle,
                    color: activeStep === i ? "#e2e8f0" : "#94a3b8",
                  }}>
                    {step.icon} {step.title}
                  </div>
                  <div style={s.stepSub}>{step.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — step detail */}
          <div style={{
            ...s.stepDetail,
            borderColor: steps[activeStep].color,
            boxShadow:   `0 0 40px rgba(${hexToRgb(steps[activeStep].color)}, 0.1)`,
          }}>
            <div style={{ ...s.detailNumber, color: steps[activeStep].color }}>
              {steps[activeStep].number}
            </div>
            <div style={s.detailIcon}>{steps[activeStep].icon}</div>
            <h2 style={s.detailTitle}>{steps[activeStep].title}</h2>
            <p style={s.detailDesc}>{steps[activeStep].description}</p>

            <div style={s.detailList}>
              {steps[activeStep].details.map((d, i) => (
                <div key={i} style={s.detailItem}>
                  <span style={{ ...s.detailDot, background: steps[activeStep].color }} />
                  <span style={s.detailText}>{d}</span>
                </div>
              ))}
            </div>

            <div style={s.stepNav}>
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                style={{ ...s.navBtn, opacity: activeStep === 0 ? 0.35 : 1 }}
              >
                ← Prev
              </button>
              <div style={s.stepDots}>
                {steps.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveStep(i)}
                    style={{
                      ...s.stepDot,
                      background:  i === activeStep ? steps[activeStep].color : "#1a2540",
                      width:       i === activeStep ? "20px" : "6px",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                style={{ ...s.navBtn, opacity: activeStep === steps.length - 1 ? 0.35 : 1 }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={s.cta}>
          <h2 style={s.ctaTitle}>Ready to start trading?</h2>
          <p style={s.ctaSub}>Join thousands of traders on TradeSphere today.</p>
          <div style={s.ctaBtns}>
            <button onClick={() => navigate("/auth/signup")} style={s.ctaPrimary}>
              Create Free Account →
            </button>
            <button onClick={() => navigate("/market")} style={s.ctaGhost}>
              View Markets
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
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

  header: { textAlign: "center", marginBottom: "60px" },
  badge: {
    display: "inline-block",
    background: "rgba(45,126,247,0.12)", border: "1px solid rgba(45,126,247,0.25)",
    borderRadius: "100px", color: "#2d7ef7",
    fontSize: "12px", fontWeight: "600", padding: "5px 16px",
    letterSpacing: "0.06em", marginBottom: "20px",
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800",
    color: "#e2e8f0", letterSpacing: "-0.03em", lineHeight: "1.15",
    marginBottom: "16px",
  },
  titleAccent: {
    background: "linear-gradient(90deg, #2d7ef7, #00e5a0)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  subtitle: { color: "#64748b", fontSize: "16px", maxWidth: "520px", margin: "0 auto", lineHeight: "1.7" },

  stepsLayout: {
    display: "grid", gridTemplateColumns: "1fr 1.4fr",
    gap: "24px", marginBottom: "80px",
    alignItems: "start",
  },

  stepList: { display: "flex", flexDirection: "column", gap: "8px" },
  stepItem: {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "14px 16px", borderRadius: "12px",
    border: "1px solid #1a2540", cursor: "pointer",
    transition: "all 0.2s ease",
  },
  stepNumber: {
    width: "36px", height: "36px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700", flexShrink: 0,
    transition: "all 0.2s",
  },
  stepTitle: { fontSize: "14px", fontWeight: "600", transition: "color 0.2s" },
  stepSub:   { fontSize: "11px", color: "#64748b", marginTop: "2px" },

  stepDetail: {
    background: "#0e1525", border: "1px solid",
    borderRadius: "20px", padding: "36px",
    position: "sticky", top: "90px",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  detailNumber: { fontSize: "48px", fontWeight: "800", opacity: 0.15, lineHeight: "1", marginBottom: "8px" },
  detailIcon:   { fontSize: "48px", marginBottom: "16px", display: "block" },
  detailTitle:  { fontSize: "24px", fontWeight: "700", color: "#e2e8f0", marginBottom: "14px", letterSpacing: "-0.02em" },
  detailDesc:   { fontSize: "14px", color: "#94a3b8", lineHeight: "1.75", marginBottom: "24px" },

  detailList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" },
  detailItem: { display: "flex", alignItems: "center", gap: "10px" },
  detailDot:  { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  detailText: { fontSize: "13.5px", color: "#e2e8f0" },

  stepNav: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBtn: {
    background: "rgba(255,255,255,0.05)", border: "1px solid #1a2540",
    borderRadius: "8px", color: "#94a3b8",
    fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: "500",
    padding: "8px 16px", cursor: "pointer", transition: "all 0.2s",
  },
  stepDots: { display: "flex", alignItems: "center", gap: "6px" },
  stepDot: {
    height: "6px", borderRadius: "3px",
    transition: "all 0.3s ease", cursor: "pointer",
  },

  cta: {
    textAlign: "center",
    background: "linear-gradient(135deg, rgba(45,126,247,0.08), rgba(0,229,160,0.05))",
    border: "1px solid rgba(45,126,247,0.2)",
    borderRadius: "24px", padding: "60px 40px",
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

export default HowItWorks;