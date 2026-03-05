import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ============================================================
   PROFILE PAGE
   - View & edit profile info
   - See virtual balance
   - Add virtual money
   - Account stats
   - Danger zone
   ============================================================ */

const ProfilePage = () => {
  const navigate = useNavigate();

  // ── Mock user — replace with useAuth() ───────────────────
  const [user, setUser] = useState({
    name:      "John Doe",
    email:     "john@example.com",
    role:      "premium",
    balance:   100000,
    joinedAt:  "January 2025",
    avatar:    "J",
    bio:       "Passionate virtual trader. Learning finance through simulation.",
  });

  const [tab,        setTab]        = useState("profile"); // profile | balance | security
  const [editMode,   setEditMode]   = useState(false);
  const [form,       setForm]       = useState({ name: user.name, email: user.email, bio: user.bio });
  const [addAmount,  setAddAmount]  = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [saveLoading,setSaveLoading]= useState(false);
  const [saved,      setSaved]      = useState(false);
  const [focused,    setFocused]    = useState("");

  // ── Stats (mock — replace with real API data) ─────────────
  const stats = [
    { label: "Total Trades",   value: "48",       icon: "⚡", color: "#2d7ef7"  },
    { label: "Win Rate",       value: "62%",      icon: "🎯", color: "#00e5a0"  },
    { label: "Total Profit",   value: "+₹12,430", icon: "📈", color: "#00e5a0"  },
    { label: "Predictions",    value: "12",       icon: "🤖", color: "#a78bfa"  },
  ];

  const quickAmounts = [10000, 25000, 50000, 100000];

  // ── Handlers ─────────────────────────────────────────────
  const handleSaveProfile = () => {
    setSaveLoading(true);
    setTimeout(() => {
      setUser({ ...user, name: form.name, email: form.email, bio: form.bio });
      setSaveLoading(false);
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  const handleAddMoney = () => {
    const amt = parseInt(addAmount);
    if (!amt || amt <= 0) return;
    setAddLoading(true);
    setTimeout(() => {
      setUser({ ...user, balance: user.balance + amt });
      setAddLoading(false);
      setAddSuccess(true);
      setAddAmount("");
      setTimeout(() => setAddSuccess(false), 2500);
    }, 1400);
  };

  const formatBalance = (n) =>
    "₹" + n.toLocaleString("en-IN");

  const tabs = [
    { id: "profile",  label: "Profile",  icon: "👤" },
    { id: "balance",  label: "Balance",  icon: "💰" },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  return (
    <div style={s.root}>
      <div style={s.gridBg} />
      <div style={{ ...s.orb, top: "-100px", left: "-80px",  background: "rgba(45,126,247,0.09)"  }} />
      <div style={{ ...s.orb, bottom: "-80px", right: "-80px", background: "rgba(0,229,160,0.06)", width: "400px", height: "400px" }} />

      <div style={s.container}>

        {/* ── Page header ─────────────────────────────────── */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>My Profile</h1>
            <p style={s.pageSub}>Manage your account, balance and settings</p>
          </div>
          {saved && (
            <div style={s.savedToast}>✅ Profile saved successfully!</div>
          )}
          {addSuccess && (
            <div style={{ ...s.savedToast, background: "rgba(0,229,160,0.12)", borderColor: "rgba(0,229,160,0.3)", color: "#00e5a0" }}>
              ✅ Money added to your balance!
            </div>
          )}
        </div>

        <div style={s.layout}>

          {/* ── LEFT — Avatar card ──────────────────────── */}
          <div style={s.leftCol}>

            {/* Avatar card */}
            <div style={s.avatarCard}>
              <div style={s.avatarCircle}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={s.avatarName}>{user.name}</div>
              <div style={s.avatarEmail}>{user.email}</div>
              {user.role === "premium"
                ? <span style={s.premiumBadge}>⭐ Premium Account</span>
                : <span style={s.freeBadge}>👤 Free Account</span>
              }
              <div style={s.joinedText}>Member since {user.joinedAt}</div>

              {user.role !== "premium" && (
                <button
                  onClick={() => navigate("/upgrade")}
                  style={s.upgradeBtn}
                >
                  ⭐ Upgrade to Premium
                </button>
              )}
            </div>

            {/* Stats card */}
            <div style={s.statsCard}>
              <div style={s.statsTitle}>Trading Stats</div>
              {stats.map((st) => (
                <div key={st.label} style={s.statRow}>
                  <div style={s.statLeft}>
                    <span style={s.statIcon}>{st.icon}</span>
                    <span style={s.statLabel}>{st.label}</span>
                  </div>
                  <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={s.quickCard}>
              {[
                { label: "View Portfolio",   path: "/portfolio",   icon: "💼" },
                { label: "Go to Markets",    path: "/market",      icon: "📊" },
                { label: "My Predictions",   path: "/predictions", icon: "🤖" },
                { label: "Leaderboard",      path: "/leaderboard", icon: "🏆" },
              ].map((l) => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.path)}
                  style={s.quickLink}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span>{l.icon} {l.label}</span>
                  <span style={s.quickArrow}>→</span>
                </button>
              ))}
            </div>

          </div>

          {/* ── RIGHT — Tabs ────────────────────────────── */}
          <div style={s.rightCol}>

            {/* Tab bar */}
            <div style={s.tabBar}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    ...s.tabBtn,
                    color:       tab === t.id ? "#e2e8f0"  : "#64748b",
                    borderBottom: tab === t.id ? "2px solid #2d7ef7" : "2px solid transparent",
                    background:  tab === t.id ? "rgba(45,126,247,0.06)" : "transparent",
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── TAB: PROFILE ─────────────────────────── */}
            {tab === "profile" && (
              <div style={s.tabContent}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>Personal Information</h2>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)} style={s.editBtn}>
                      ✏️ Edit Profile
                    </button>
                  ) : (
                    <button onClick={() => { setEditMode(false); setForm({ name: user.name, email: user.email, bio: user.bio }); }} style={s.cancelBtn}>
                      ✕ Cancel
                    </button>
                  )}
                </div>

                {editMode ? (
                  /* ── Edit form ── */
                  <div style={s.editForm}>
                    <Field label="Full Name" focused={focused === "name"}>
                      <input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        style={{ ...s.input, borderColor: focused === "name" ? "#2d7ef7" : "#1a2540" }}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused("")}
                        placeholder="Your full name"
                      />
                    </Field>
                    <Field label="Email Address" focused={focused === "email"}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        style={{ ...s.input, borderColor: focused === "email" ? "#2d7ef7" : "#1a2540" }}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused("")}
                        placeholder="your@email.com"
                      />
                    </Field>
                    <Field label="Bio" focused={focused === "bio"}>
                      <textarea
                        value={form.bio}
                        onChange={e => setForm({ ...form, bio: e.target.value })}
                        rows={3}
                        style={{ ...s.input, ...s.textarea, borderColor: focused === "bio" ? "#2d7ef7" : "#1a2540" }}
                        onFocus={() => setFocused("bio")}
                        onBlur={() => setFocused("")}
                        placeholder="Tell us about yourself..."
                      />
                    </Field>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      style={{ ...s.saveBtn, opacity: saveLoading ? 0.7 : 1 }}
                    >
                      {saveLoading ? <span style={s.spinner} /> : "Save Changes →"}
                    </button>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div style={s.profileView}>
                    <InfoRow label="Full Name"  value={user.name}     />
                    <InfoRow label="Email"      value={user.email}    />
                    <InfoRow label="Account"    value={user.role === "premium" ? "⭐ Premium" : "👤 Free"} />
                    <InfoRow label="Member Since" value={user.joinedAt} />
                    <div style={s.bioRow}>
                      <div style={s.infoLabel}>Bio</div>
                      <div style={s.bioText}>{user.bio || "No bio added yet."}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: BALANCE ─────────────────────────── */}
            {tab === "balance" && (
              <div style={s.tabContent}>
                <h2 style={s.sectionTitle}>Virtual Balance</h2>

                {/* Balance display */}
                <div style={s.balanceCard}>
                  <div style={s.balanceLabel}>Available Balance</div>
                  <div style={s.balanceAmount}>{formatBalance(user.balance)}</div>
                  <div style={s.balanceSub}>Virtual money — not real currency</div>
                  <div style={s.balanceBar}>
                    <div style={{
                      ...s.balanceFill,
                      width: `${Math.min((user.balance / 500000) * 100, 100)}%`,
                    }} />
                  </div>
                  <div style={s.balanceBarLabel}>
                    {Math.round((user.balance / 500000) * 100)}% of ₹5,00,000 max
                  </div>
                </div>

                {/* Add money section */}
                <div style={s.addMoneyCard}>
                  <h3 style={s.addTitle}>Add Virtual Money</h3>
                  <p style={s.addSub}>Top up your balance to keep trading. This is all virtual.</p>

                  {/* Quick amounts */}
                  <div style={s.quickAmounts}>
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAddAmount(String(amt))}
                        style={{
                          ...s.quickAmtBtn,
                          borderColor: addAmount === String(amt) ? "#2d7ef7" : "#1a2540",
                          color:       addAmount === String(amt) ? "#2d7ef7" : "#94a3b8",
                          background:  addAmount === String(amt) ? "rgba(45,126,247,0.08)" : "transparent",
                        }}
                      >
                        +{formatBalance(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <div style={s.customAmtRow}>
                    <div style={s.rupeePrefix}>₹</div>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={addAmount}
                      onChange={e => setAddAmount(e.target.value)}
                      style={{
                        ...s.input,
                        ...s.amtInput,
                        borderColor: focused === "amount" ? "#2d7ef7" : "#1a2540",
                        borderLeft: "none",
                        borderRadius: "0 10px 10px 0",
                      }}
                      onFocus={() => setFocused("amount")}
                      onBlur={() => setFocused("")}
                    />
                  </div>

                  <button
                    onClick={handleAddMoney}
                    disabled={addLoading || !addAmount}
                    style={{
                      ...s.addBtn,
                      opacity: (addLoading || !addAmount) ? 0.6 : 1,
                      cursor:  (addLoading || !addAmount) ? "not-allowed" : "pointer",
                    }}
                  >
                    {addLoading
                      ? <span style={s.spinner} />
                      : `Add ${addAmount ? formatBalance(parseInt(addAmount) || 0) : "Money"} →`
                    }
                  </button>
                </div>

                {/* Transaction hint */}
                <div style={s.hintBox}>
                  <span style={s.hintIcon}>💡</span>
                  <span style={s.hintText}>
                    Your balance decreases when you buy stocks and increases when you sell.
                    This simulates a real brokerage account.
                  </span>
                </div>
              </div>
            )}

            {/* ── TAB: SECURITY ────────────────────────── */}
            {tab === "security" && (
              <div style={s.tabContent}>
                <h2 style={s.sectionTitle}>Security Settings</h2>

                {/* Change password */}
                <div style={s.secCard}>
                  <h3 style={s.secTitle}>🔐 Change Password</h3>
                  <p style={s.secDesc}>Update your password to keep your account secure.</p>
                  <div style={s.editForm}>
                    <Field label="Current Password">
                      <input type="password" placeholder="••••••••" style={{ ...s.input, borderColor: "#1a2540" }} />
                    </Field>
                    <Field label="New Password">
                      <input type="password" placeholder="••••••••" style={{ ...s.input, borderColor: "#1a2540" }} />
                    </Field>
                    <Field label="Confirm New Password">
                      <input type="password" placeholder="••••••••" style={{ ...s.input, borderColor: "#1a2540" }} />
                    </Field>
                    <button style={s.saveBtn}>Update Password →</button>
                  </div>
                </div>

                {/* Danger zone */}
                <div style={s.dangerCard}>
                  <h3 style={s.dangerTitle}>⚠️ Danger Zone</h3>
                  <div style={s.dangerRow}>
                    <div>
                      <div style={s.dangerLabel}>Reset Portfolio</div>
                      <div style={s.dangerDesc}>Wipe all trades and reset balance to ₹1,00,000</div>
                    </div>
                    <button style={s.dangerBtnOrange}>Reset</button>
                  </div>
                  <div style={s.dangerDivider} />
                  <div style={s.dangerRow}>
                    <div>
                      <div style={s.dangerLabel}>Delete Account</div>
                      <div style={s.dangerDesc}>Permanently delete your account and all data</div>
                    </div>
                    <button style={s.dangerBtnRed}>Delete</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px);} to { opacity:1; transform:translateX(0);} }
      `}</style>
    </div>
  );
};

/* ── Sub-components ──────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
    <label style={{ fontSize: "11.5px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </label>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #1a2540" }}>
    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{label}</span>
    <span style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "500" }}>{value}</span>
  </div>
);

/* ============================================================
   STYLES
   ============================================================ */
const s = {
  root: {
    minHeight: "100vh", background: "#090e1a",
    fontFamily: "'Poppins', sans-serif",
    position: "relative", overflow: "hidden",
    padding: "40px 24px 80px",
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

  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "12px",
  },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em" },
  pageSub:   { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  savedToast: {
    background: "rgba(45,126,247,0.12)", border: "1px solid rgba(45,126,247,0.3)",
    borderRadius: "10px", color: "#2d7ef7",
    fontSize: "13px", fontWeight: "500", padding: "10px 16px",
    animation: "fadeIn 0.3s ease both",
  },

  layout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" },

  /* Left col */
  leftCol: { display: "flex", flexDirection: "column", gap: "16px" },

  avatarCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "20px", padding: "28px",
    display: "flex", flexDirection: "column",
    alignItems: "center", textAlign: "center", gap: "8px",
  },
  avatarCircle: {
    width: "72px", height: "72px", borderRadius: "50%",
    background: "linear-gradient(135deg, #2d7ef7, #00e5a0)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "28px", fontWeight: "800", color: "#fff",
    marginBottom: "8px",
    boxShadow: "0 0 24px rgba(45,126,247,0.3)",
  },
  avatarName:  { fontSize: "18px", fontWeight: "700", color: "#e2e8f0" },
  avatarEmail: { fontSize: "13px", color: "#64748b" },
  premiumBadge: {
    background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)",
    borderRadius: "100px", color: "#a78bfa",
    fontSize: "12px", fontWeight: "600", padding: "4px 12px",
  },
  freeBadge: {
    background: "rgba(100,116,139,0.1)", border: "1px solid #1a2540",
    borderRadius: "100px", color: "#64748b",
    fontSize: "12px", fontWeight: "600", padding: "4px 12px",
  },
  joinedText: { fontSize: "11px", color: "#374151", marginTop: "4px" },
  upgradeBtn: {
    width: "100%", marginTop: "8px",
    background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(45,126,247,0.15))",
    border: "1px solid rgba(167,139,250,0.3)", borderRadius: "10px",
    color: "#a78bfa", fontFamily: "'Poppins', sans-serif",
    fontSize: "13px", fontWeight: "600", padding: "10px", cursor: "pointer",
  },

  statsCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "16px", padding: "20px",
  },
  statsTitle: { fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" },
  statRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "10px 0",
    borderBottom: "1px solid #1a2540",
  },
  statLeft:  { display: "flex", alignItems: "center", gap: "8px" },
  statIcon:  { fontSize: "16px" },
  statLabel: { fontSize: "13px", color: "#94a3b8" },
  statValue: { fontSize: "14px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" },

  quickCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "16px", overflow: "hidden",
  },
  quickLink: {
    width: "100%", display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "13px 18px",
    background: "transparent", border: "none",
    borderBottom: "1px solid #1a2540",
    color: "#94a3b8", fontFamily: "'Poppins', sans-serif",
    fontSize: "13.5px", fontWeight: "500", cursor: "pointer",
    transition: "background 0.15s", textAlign: "left",
  },
  quickArrow: { color: "#374151", fontSize: "14px" },

  /* Right col */
  rightCol: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "20px", overflow: "hidden",
  },

  tabBar: { display: "flex", borderBottom: "1px solid #1a2540" },
  tabBtn: {
    flex: 1, padding: "16px", border: "none",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", fontWeight: "500",
    cursor: "pointer", transition: "all 0.2s",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: "6px",
  },

  tabContent: { padding: "32px", animation: "slideIn 0.25s ease both" },
  sectionHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "24px",
  },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.01em" },
  editBtn: {
    background: "rgba(45,126,247,0.1)", border: "1px solid rgba(45,126,247,0.25)",
    borderRadius: "9px", color: "#2d7ef7",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px", fontWeight: "500", padding: "8px 16px", cursor: "pointer",
  },
  cancelBtn: {
    background: "transparent", border: "1px solid #1a2540",
    borderRadius: "9px", color: "#64748b",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px", fontWeight: "500", padding: "8px 16px", cursor: "pointer",
  },

  editForm:    { display: "flex", flexDirection: "column", gap: "18px" },
  profileView: { display: "flex", flexDirection: "column" },

  input: {
    width: "100%", background: "#090e1a",
    border: "1px solid", borderRadius: "10px",
    color: "#e2e8f0", fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", padding: "11px 14px",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  },
  textarea: { resize: "vertical", minHeight: "90px", lineHeight: "1.6" },

  saveBtn: {
    background: "#2d7ef7", border: "none", borderRadius: "10px",
    color: "#fff", fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", fontWeight: "600", padding: "12px",
    cursor: "pointer", boxShadow: "0 4px 16px rgba(45,126,247,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  spinner: {
    width: "16px", height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff", borderRadius: "50%",
    display: "inline-block", animation: "spin 0.7s linear infinite",
  },

  infoLabel: { fontSize: "11.5px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" },
  bioRow:    { paddingTop: "14px" },
  bioText:   { fontSize: "14px", color: "#94a3b8", lineHeight: "1.7" },

  /* Balance tab */
  balanceCard: {
    background: "linear-gradient(135deg, rgba(45,126,247,0.08), rgba(0,229,160,0.05))",
    border: "1px solid rgba(45,126,247,0.2)",
    borderRadius: "16px", padding: "28px",
    marginBottom: "24px", textAlign: "center",
  },
  balanceLabel: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  balanceAmount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "40px", fontWeight: "700", color: "#00e5a0",
    marginBottom: "6px", letterSpacing: "-0.02em",
  },
  balanceSub: { fontSize: "12px", color: "#374151", marginBottom: "20px" },
  balanceBar: {
    height: "6px", background: "#1a2540",
    borderRadius: "3px", overflow: "hidden", marginBottom: "8px",
  },
  balanceFill: {
    height: "100%", borderRadius: "3px",
    background: "linear-gradient(90deg, #2d7ef7, #00e5a0)",
    transition: "width 0.5s ease",
  },
  balanceBarLabel: { fontSize: "11px", color: "#374151" },

  addMoneyCard: {
    background: "#131d30", border: "1px solid #1a2540",
    borderRadius: "16px", padding: "24px", marginBottom: "16px",
  },
  addTitle: { fontSize: "16px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" },
  addSub:   { fontSize: "13px", color: "#64748b", marginBottom: "20px" },

  quickAmounts: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" },
  quickAmtBtn: {
    background: "transparent", border: "1px solid",
    borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px", fontWeight: "600", padding: "9px 4px",
    cursor: "pointer", transition: "all 0.15s",
  },

  customAmtRow: { display: "flex", marginBottom: "16px" },
  rupeePrefix: {
    background: "#1a2540", border: "1px solid #1a2540",
    borderRight: "none", borderRadius: "10px 0 0 10px",
    color: "#64748b", fontSize: "16px", fontWeight: "600",
    padding: "11px 14px", display: "flex", alignItems: "center",
  },
  amtInput: { flex: 1 },

  addBtn: {
    width: "100%", background: "linear-gradient(135deg, #2d7ef7, #00b37d)",
    border: "none", borderRadius: "10px",
    color: "#fff", fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", fontWeight: "600", padding: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,229,160,0.25)",
    transition: "all 0.2s",
  },

  hintBox: {
    background: "rgba(255,209,102,0.06)", border: "1px solid rgba(255,209,102,0.15)",
    borderRadius: "10px", padding: "14px 16px",
    display: "flex", gap: "10px", alignItems: "flex-start",
  },
  hintIcon: { fontSize: "16px", flexShrink: 0 },
  hintText: { fontSize: "12.5px", color: "#94a3b8", lineHeight: "1.6" },

  /* Security tab */
  secCard: {
    background: "#131d30", border: "1px solid #1a2540",
    borderRadius: "16px", padding: "24px", marginBottom: "20px",
  },
  secTitle: { fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" },
  secDesc:  { fontSize: "13px", color: "#64748b", marginBottom: "20px" },

  dangerCard: {
    background: "rgba(255,77,109,0.04)", border: "1px solid rgba(255,77,109,0.15)",
    borderRadius: "16px", padding: "24px",
  },
  dangerTitle: { fontSize: "15px", fontWeight: "700", color: "#ff4d6d", marginBottom: "16px" },
  dangerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" },
  dangerLabel: { fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "3px" },
  dangerDesc:  { fontSize: "12px", color: "#64748b" },
  dangerDivider: { height: "1px", background: "rgba(255,77,109,0.1)", margin: "16px 0" },
  dangerBtnOrange: {
    background: "rgba(255,140,66,0.1)", border: "1px solid rgba(255,140,66,0.3)",
    borderRadius: "8px", color: "#ff8c42",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px", fontWeight: "600", padding: "8px 18px",
    cursor: "pointer", flexShrink: 0,
  },
  dangerBtnRed: {
    background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)",
    borderRadius: "8px", color: "#ff4d6d",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px", fontWeight: "600", padding: "8px 18px",
    cursor: "pointer", flexShrink: 0,
  },
};

export default ProfilePage;