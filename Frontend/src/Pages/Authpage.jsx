import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Authpage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const isLogin = type === "login";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: connect to backend API
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div style={styles.root}>
      <div style={styles.gridOverlay} />
      <div style={{ ...styles.orb, ...styles.orbBlue }} />
      <div style={{ ...styles.orb, ...styles.orbGreen }} />

      <div style={styles.container}>

        {/* ── LEFT PANEL ── */}
        <div style={styles.leftPanel}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>📈</div>
            <span style={styles.logoText}>TradeSphere</span>
          </div>

          <div style={styles.tagline}>
            <h1 style={styles.heroText}>
              Trade Smarter<br />
              <span style={styles.heroAccent}>with AI Insights</span>
            </h1>
            <p style={styles.heroSub}>
              Real-time order matching, live order book,
              and ML-powered price predictions — all in one platform.
            </p>
          </div>

          

          <div style={styles.tickerWrap}>
            <div style={styles.tickerInner}>
              {[
                { sym: "TECHX",  chg: "+2.4%" },
                { sym: "INFRAZ", chg: "-1.1%" },
                { sym: "FINCO",  chg: "+0.8%" },
                { sym: "ENRGX",  chg: "+3.2%" },
                { sym: "MEDIX",  chg: "-0.5%" },
                { sym: "AUTOX",  chg: "+1.7%" },
                { sym: "TECHX",  chg: "+2.4%" },
                { sym: "INFRAZ", chg: "-1.1%" },
              ].map((t, i) => (
                <span key={i} style={{
                  ...styles.tickerItem,
                  color: t.chg.includes("+") ? "#00e5a0" : "#ff4d6d",
                }}>
                  {t.sym} <strong>{t.chg}</strong>
                </span>
              ))}
            </div>
          </div>

          <div style={styles.featureList}>
            {[
              "⚡ Real-time order matching engine",
              "📊 Live order book via Socket.IO",
              "🤖 AI price predictions (Premium)",
              "🏆 Leaderboard & portfolio tracking",
            ].map((f) => (
              <div key={f} style={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>

            {/* Tabs */}
            <div style={styles.tabRow}>
              {["login", "signup"].map((t) => (
                <button
                  key={t}
                  onClick={() => navigate(`/auth/${t}`)}
                  style={{
                    ...styles.tab,
                    ...(type === t ? styles.tabActive : styles.tabInactive),
                  }}
                >
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Header */}
            <div>
              <h2 style={styles.formTitle}>
                {isLogin ? "Welcome back 👋" : "Create account 🚀"}
              </h2>
              <p style={styles.formSub}>
                {isLogin
                  ? "Login to access your portfolio and live markets"
                  : "Start with ₹1,00,000 virtual cash — no real money needed"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={styles.form}>

              {/* Name (signup only) */}
              {!isLogin && (
                <Field label="Full Name">
                  <InputBox
                    name="name" type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    icon="👤"
                  />
                </Field>
              )}

              {/* Email */}
              <Field label="Email Address">
                <InputBox
                  name="email" type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  icon="✉️"
                />
              </Field>

              {/* Password */}
              <Field
                label="Password"
                right={isLogin && (
                  <span style={styles.forgotLink}>Forgot password?</span>
                )}
              >
                <div style={{ position: "relative" }}>
                  <InputBox
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    icon="🔒"
                    extraPadding
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </Field>

              {/* Role selector (signup only) */}
              {!isLogin && (
                <Field label="Account Type">
                  <div style={styles.roleRow}>
                    {[
                      { value: "user",    label: "Free",    icon: "👤", desc: "Basic trading"    },
                      { value: "premium", label: "Premium", icon: "⭐", desc: "AI predictions"   },
                    ].map((r) => (
                      <div
                        key={r.value}
                        onClick={() => setSelectedRole(r.value)}
                        style={{
                          ...styles.roleCard,
                          borderColor: selectedRole === r.value
                            ? "#2d7ef7"
                            : "#1a2540",
                          background: selectedRole === r.value
                            ? "rgba(45,126,247,0.08)"
                            : "#090e1a",
                        }}
                      >
                        <span style={styles.roleIcon}>{r.icon}</span>
                        <span style={styles.roleLabel}>{r.label}</span>
                        <span style={styles.roleDesc}>{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </Field>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.75 : 1,
                  cursor:  loading ? "not-allowed" : "pointer",
                }}
              >
                {loading
                  ? <span style={styles.spinner} />
                  : <>{isLogin ? "Login to Dashboard" : "Create Account"} →</>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Switch */}
            <p style={styles.switchText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span
                onClick={() => navigate(isLogin ? "/auth/signup" : "/auth/login")}
                style={styles.switchLink}
              >
                {isLogin ? " Sign Up" : " Login"}
              </span>
            </p>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes tickerScroll {
          0%   { transform: translateX(0);    }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #090e1a inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
      `}</style>
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────── */
const Field = ({ label, right, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <label style={styles.label}>{label}</label>
      {right}
    </div>
    {children}
  </div>
);

const InputBox = ({ icon, extraPadding, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <span style={styles.inputIcon}>{icon}</span>
      <input
        {...props}
        required
        style={{
          ...styles.input,
          paddingRight: extraPadding ? "44px" : "14px",
          borderColor:  focused ? "#2d7ef7" : "#1a2540",
          boxShadow:    focused ? "0 0 0 3px rgba(45,126,247,0.12)" : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

/* ============================================================
   STYLES
   ============================================================ */
const styles = {
  root: {
    minHeight:      "100vh",
    background:     "#090e1a",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontFamily:     "'Poppins', system-ui, sans-serif",
    position:       "relative",
    overflow:       "hidden",
    padding:        "24px 16px",
  },
  gridOverlay: {
    position:   "absolute",
    inset:      0,
    backgroundImage:
      "linear-gradient(rgba(45,126,247,0.035) 1px, transparent 1px)," +
      "linear-gradient(90deg, rgba(45,126,247,0.035) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents:  "none",
  },
  orb: {
    position:      "absolute",
    borderRadius:  "50%",
    filter:        "blur(90px)",
    pointerEvents: "none",
  },
  orbBlue: {
    width: "520px", height: "520px",
    top: "-180px", left: "-120px",
    background: "rgba(45,126,247,0.11)",
  },
  orbGreen: {
    width: "420px", height: "420px",
    bottom: "-120px", right: "-80px",
    background: "rgba(0,229,160,0.07)",
  },
  container: {
    display:      "flex",
    width:        "100%",
    maxWidth:     "1040px",
    borderRadius: "24px",
    border:       "1px solid #1a2540",
    overflow:     "hidden",
    position:     "relative",
    zIndex:       1,
    boxShadow:    "0 32px 80px rgba(0,0,0,0.65)",
    animation:    "fadeIn 0.45s ease both",
  },

  /* LEFT */
  leftPanel: {
    flex:          "1",
    background:    "linear-gradient(145deg, #0a1628 0%, #0d1e35 100%)",
    padding:       "44px 40px",
    display:       "flex",
    flexDirection: "column",
    gap:           "28px",
    borderRight:   "1px solid #1a2540",
    minWidth:      0,
  },
  logoRow: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: {
    fontSize: "24px", background: "rgba(45,126,247,0.12)",
    border: "1px solid rgba(45,126,247,0.25)", borderRadius: "10px",
    width: "42px", height: "42px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: "19px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.02em" },

  tagline: {},
  heroText: {
    fontSize: "clamp(1.5rem, 2.8vw, 2.25rem)",
    fontWeight: "800", color: "#e2e8f0",
    lineHeight: "1.15", letterSpacing: "-0.03em", marginBottom: "14px",
  },
  heroAccent: {
    background: "linear-gradient(90deg, #2d7ef7, #00e5a0)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  heroSub: { color: "#64748b", fontSize: "13.5px", lineHeight: "1.7", maxWidth: "310px" },

  statsRow: { display: "flex", gap: "12px" },
  statBox: {
    flex: 1, background: "rgba(255,255,255,0.03)",
    border: "1px solid #1a2540", borderRadius: "10px",
    padding: "12px 10px", display: "flex", flexDirection: "column", gap: "3px",
  },
  statValue: { fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "600", color: "#2d7ef7" },
  statLabel: { fontSize: "9.5px", color: "#64748b", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.07em" },

  tickerWrap: {
    overflow: "hidden", borderRadius: "8px",
    background: "rgba(0,0,0,0.2)", border: "1px solid #1a2540", padding: "10px 0",
  },
  tickerInner: {
    display: "flex", gap: "28px",
    animation: "tickerScroll 14s linear infinite", width: "max-content",
  },
  tickerItem: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px", whiteSpace: "nowrap", paddingLeft: "16px",
  },

  featureList: { display: "flex", flexDirection: "column", gap: "8px" },
  featureItem: { fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" },

  /* RIGHT */
  rightPanel: {
    width: "400px", flexShrink: 0, background: "#0e1525",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px",
  },
  formCard: { width: "100%", display: "flex", flexDirection: "column", gap: "22px" },

  tabRow: {
    display: "flex", background: "#090e1a",
    borderRadius: "10px", padding: "4px", border: "1px solid #1a2540",
  },
  tab: {
    flex: 1, padding: "9px", borderRadius: "7px", border: "none",
    fontSize: "13px", fontFamily: "'Poppins', sans-serif",
    fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease",
  },
  tabActive:   { background: "#2d7ef7", color: "#fff", boxShadow: "0 0 16px rgba(45,126,247,0.3)" },
  tabInactive: { background: "transparent", color: "#64748b" },

  formTitle: { fontSize: "21px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.02em", marginBottom: "6px" },
  formSub:   { fontSize: "13px", color: "#64748b", lineHeight: "1.5" },

  form:  { display: "flex", flexDirection: "column", gap: "16px" },
  label: { fontSize: "11.5px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" },
  forgotLink: { fontSize: "12px", color: "#2d7ef7", cursor: "pointer" },

  inputIcon: { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none", zIndex: 1 },
  input: {
    width: "100%", background: "#090e1a",
    border: "1px solid #1a2540", borderRadius: "10px",
    color: "#e2e8f0", fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", padding: "11px 14px 11px 40px",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: 0,
  },

  roleRow: { display: "flex", gap: "10px" },
  roleCard: {
    flex: 1, border: "1px solid", borderRadius: "10px",
    padding: "12px", cursor: "pointer",
    display: "flex", flexDirection: "column", gap: "3px",
    transition: "all 0.2s ease",
  },
  roleIcon:  { fontSize: "18px" },
  roleLabel: { fontSize: "13px", fontWeight: "600", color: "#e2e8f0" },
  roleDesc:  { fontSize: "11px", color: "#64748b" },

  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #2d7ef7, #1a5fd4)",
    color: "#fff", border: "none", borderRadius: "10px",
    padding: "13px", fontSize: "15px", fontWeight: "700",
    fontFamily: "'Poppins', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    boxShadow: "0 4px 20px rgba(45,126,247,0.35)",
    transition: "all 0.2s ease", marginTop: "4px",
  },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%", display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  dividerRow: { display: "flex", alignItems: "center", gap: "12px" },
  dividerLine: { flex: 1, height: "1px", background: "#1a2540" },
  dividerText: { fontSize: "12px", color: "#64748b" },

  switchText: { textAlign: "center", fontSize: "13px", color: "#64748b" },
  switchLink: { color: "#2d7ef7", fontWeight: "600", cursor: "pointer" },
};

export default Authpage;