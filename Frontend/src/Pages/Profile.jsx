import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { useAuth }             from "../Context/AuthContext";
import { authService }         from "../services/authService";
import portfolioService        from "../services/portfolioService";

const ProfilePage = () => {
  const navigate                         = useNavigate();
  const { user, refreshUser, isPremium } = useAuth();

  const [tab,          setTab]          = useState("profile");
  const [editMode,     setEditMode]     = useState(false);
  const [form,         setForm]         = useState({ name: "", email: "", bio: "" });
  const [focused,      setFocused]      = useState("");
  const [saveLoading,  setSaveLoading]  = useState(false);
  const [saveMsg,      setSaveMsg]      = useState(null);
  const [pwForm,       setPwForm]       = useState({ current: "", next: "", confirm: "" });
  const [pwLoading,    setPwLoading]    = useState(false);
  const [pwMsg,        setPwMsg]        = useState(null);
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) setForm({ name: user.name ?? "", email: user.email ?? "", bio: user.bio ?? "" });
  }, [user]);

  useEffect(() => {
    portfolioService.getSummary()
      .then(res => setStats(res?.summary ?? res))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

 const handleSaveProfile = async () => {
  setSaveLoading(true); setSaveMsg(null);
  try {
   
    await authService.updateProfile({ name: form.name, email: form.email, bio: form.bio });
    console.log("Hello this is your bio",form.bio)
    await refreshUser();
    setSaveMsg({ type: "success", text: "Profile saved successfully!" });
    setEditMode(false);
  } catch (err) {
    setSaveMsg({ type: "error", text: err?.response?.data?.message ?? "Failed to save profile." });
  } finally {
    setSaveLoading(false);
    setTimeout(() => setSaveMsg(null), 3000);
  }
};

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next) return setPwMsg({ type: "error", text: "Fill all fields." });
    if (pwForm.next !== pwForm.confirm)  return setPwMsg({ type: "error", text: "Passwords do not match." });
    if (pwForm.next.length < 6)         return setPwMsg({ type: "error", text: "Minimum 6 characters." });
    setPwLoading(true); setPwMsg(null);
    try {
      await authService.changePassword(pwForm.current, pwForm.next);
      setPwMsg({ type: "success", text: "Password updated successfully!" });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err?.response?.data?.message ?? "Failed to change password." });
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(null), 3000);
    }
  };

  const fmt    = (n) => "₹" + Number(n ?? 0).toLocaleString("en-IN");
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  const statRows = [
    { label: "Total Trades", value: stats?.totalTrades ?? "—",  icon: "⚡", color: "#2d7ef7" },
    { label: "Win Rate",     value: stats?.winRate != null ? `${stats.winRate}%` : "—", icon: "🎯", color: "#00e5a0" },
    { label: "Total P&L",   value: stats?.totalPnl  != null ? `${stats.totalPnl >= 0 ? "+" : ""}₹${Math.abs(stats.totalPnl).toLocaleString("en-IN")}` : "—", icon: "📈", color: (stats?.totalPnl ?? 0) >= 0 ? "#00e5a0" : "#ff4d6d" },
    { label: "Net Worth",   value: stats?.netWorth   != null ? fmt(stats.netWorth)  : "—", icon: "💼", color: "#a78bfa" },
    { label: "Cash Balance",value: stats?.cashBalance != null ? fmt(stats.cashBalance) : "—", icon: "💰", color: "#00e5a0" },
  ];

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#090e1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #1a2540", borderTop: "3px solid #2d7ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const tabs = [
    { id: "profile",  label: "Profile",  icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  return (
    <div style={s.root}>
      <div style={s.gridBg} />
      <div style={{ ...s.orb, top: "-100px", left: "-80px",  background: "rgba(45,126,247,0.09)"  }} />
      <div style={{ ...s.orb, bottom: "-80px", right: "-80px", background: "rgba(0,229,160,0.06)", width: "400px", height: "400px" }} />

      <div style={s.container}>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>My Profile</h1>
            <p style={s.pageSub}>Manage your account and settings</p>
          </div>
          {saveMsg && <div style={{ ...s.toast, ...(saveMsg.type === "success" ? s.toastOk : s.toastErr) }}>{saveMsg.type === "success" ? "✅" : "⚠️"} {saveMsg.text}</div>}
        </div>

        <div style={s.layout}>

          {/* LEFT */}
          <div style={s.leftCol}>
            <div style={s.avatarCard}>
              <div style={s.avatarCircle}>{user.name?.charAt(0).toUpperCase() ?? "?"}</div>
              <div style={s.avatarName}>{user.name}</div>
              <div style={s.avatarEmail}>{user.email}</div>
              {isPremium ? <span style={s.premBadge}>⭐ Premium Account</span> : <span style={s.freeBadge}>👤 Free Account</span>}
              <div style={s.joinedText}>Member since {joined}</div>
              {!isPremium && <button onClick={() => navigate("/upgrade")} style={s.upgradeBtn}>⭐ Upgrade to Premium</button>}
            </div>

            <div style={s.statsCard}>
              <div style={s.statsTitle}>Trading Stats</div>
              {statsLoading
                ? <div style={{ textAlign: "center", padding: "16px", color: "#374151", fontSize: "13px" }}>Loading...</div>
                : statRows.map((st, i) => (
                  <div key={st.label} style={{ ...s.statRow, borderBottom: i < statRows.length - 1 ? "1px solid #1a2540" : "none" }}>
                    <div style={s.statLeft}><span style={s.statIcon}>{st.icon}</span><span style={s.statLabel}>{st.label}</span></div>
                    <span style={{ ...s.statVal, color: st.color }}>{st.value}</span>
                  </div>
                ))
              }
            </div>

            <div style={s.quickCard}>
              {[
                { label: "View Portfolio",  path: "/portfolio",   icon: "💼" },
                { label: "Go to Markets",   path: "/market",      icon: "📊" },
                { label: "My Predictions",  path: "/predictions", icon: "🤖" },
                { label: "Leaderboard",     path: "/leaderboard", icon: "🏆" },
              ].map((l) => (
                <button key={l.label} onClick={() => navigate(l.path)} style={s.quickLink}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span>{l.icon} {l.label}</span><span style={s.quickArrow}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={s.rightCol}>
            <div style={s.tabBar}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ ...s.tabBtn, color: tab === t.id ? "#e2e8f0" : "#64748b", borderBottom: tab === t.id ? "2px solid #2d7ef7" : "2px solid transparent", background: tab === t.id ? "rgba(45,126,247,0.06)" : "transparent" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {tab === "profile" && (
              <div style={s.tabContent}>
                <div style={s.secHdr}>
                  <h2 style={s.secTitle2}>Personal Information</h2>
                  {!editMode
                    ? <button onClick={() => setEditMode(true)} style={s.editBtn}>✏️ Edit Profile</button>
                    : <button onClick={() => { setEditMode(false); setForm({ name: user.name, email: user.email, bio: user.bio ?? "" }); }} style={s.cancelBtn}>✕ Cancel</button>
                  }
                </div>

                {editMode ? (
                  <div style={s.editForm}>
                    <Field label="Full Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...s.input, borderColor: focused === "name" ? "#2d7ef7" : "#1a2540" }} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} placeholder="Your full name" /></Field>
                    <Field label="Email Address"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...s.input, borderColor: focused === "email" ? "#2d7ef7" : "#1a2540" }} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} placeholder="your@email.com" /></Field>
                    <Field label="Bio"><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} style={{ ...s.input, resize: "vertical", minHeight: "90px", lineHeight: "1.6", borderColor: focused === "bio" ? "#2d7ef7" : "#1a2540" }} onFocus={() => setFocused("bio")} onBlur={() => setFocused("")} placeholder="Tell us about yourself..." /></Field>
                    <button onClick={handleSaveProfile} disabled={saveLoading} style={{ ...s.saveBtn, opacity: saveLoading ? 0.7 : 1 }}>
                      {saveLoading ? <span style={s.spinner} /> : "Save Changes →"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <InfoRow label="Full Name"    value={user.name} />
                    <InfoRow label="Email"        value={user.email} />
                    <InfoRow label="Account"      value={isPremium ? "⭐ Premium" : "👤 Free"} />
                    <InfoRow label="Member Since" value={joined} />
                    <div style={{ paddingTop: "14px" }}>
                      <div style={s.infoLabel}>Bio</div>
                      <div style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.7" }}>{user.bio || "No bio added yet."}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "security" && (
              <div style={s.tabContent}>
                <h2 style={{ ...s.secTitle2, marginBottom: "24px" }}>Security Settings</h2>

                <div style={s.secBox}>
                  <h3 style={s.secName}>🔐 Change Password</h3>
                  <p style={s.secDesc}>Update your password to keep your account secure.</p>
                  {pwMsg && <div style={{ ...s.toast, ...(pwMsg.type === "success" ? s.toastOk : s.toastErr), marginBottom: "16px" }}>{pwMsg.type === "success" ? "✅" : "⚠️"} {pwMsg.text}</div>}
                  <div style={s.editForm}>
                    <Field label="Current Password"><input type="password" placeholder="••••••••" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} style={{ ...s.input, borderColor: focused === "cur" ? "#2d7ef7" : "#1a2540" }} onFocus={() => setFocused("cur")} onBlur={() => setFocused("")} /></Field>
                    <Field label="New Password"><input type="password" placeholder="••••••••" value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} style={{ ...s.input, borderColor: focused === "nxt" ? "#2d7ef7" : "#1a2540" }} onFocus={() => setFocused("nxt")} onBlur={() => setFocused("")} /></Field>
                    <Field label="Confirm New Password"><input type="password" placeholder="••••••••" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} style={{ ...s.input, borderColor: focused === "cnf" ? "#2d7ef7" : "#1a2540" }} onFocus={() => setFocused("cnf")} onBlur={() => setFocused("")} /></Field>
                    <button onClick={handleChangePassword} disabled={pwLoading} style={{ ...s.saveBtn, opacity: pwLoading ? 0.7 : 1 }}>
                      {pwLoading ? <span style={s.spinner} /> : "Update Password →"}
                    </button>
                  </div>
                </div>

                <div style={s.dangerCard}>
                  <h3 style={s.dangerTitle}>⚠️ Danger Zone</h3>
                  <div style={s.dangerRow}>
                    <div><div style={s.dangerLabel}>Reset Portfolio</div><div style={s.dangerDesc}>Wipe all trades and reset balance to ₹1,00,000</div></div>
                    <button style={s.dangerOrange} onClick={() => window.confirm("Reset your entire portfolio? This cannot be undone.")}>Reset</button>
                  </div>
                  <div style={s.dangerDivider} />
                  <div style={s.dangerRow}>
                    <div><div style={s.dangerLabel}>Delete Account</div><div style={s.dangerDesc}>Permanently delete your account and all data</div></div>
                    <button style={s.dangerRed} onClick={() => window.confirm("Delete account permanently?")}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
    <label style={{ fontSize: "11.5px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #1a2540" }}>
    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{label}</span>
    <span style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: "500" }}>{value}</span>
  </div>
);

const s = {
  root:      { minHeight: "100vh", background: "#090e1a", fontFamily: "'Poppins', sans-serif", position: "relative", overflow: "hidden", padding: "40px 24px 80px" },
  gridBg:    { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(45,126,247,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" },
  orb:       { position: "absolute", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", width: "500px", height: "500px" },
  container: { maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 },
  pageHeader:{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "12px" },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em" },
  pageSub:   { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  toast:     { borderRadius: "10px", fontSize: "13px", fontWeight: "500", padding: "10px 16px", animation: "fadeIn 0.3s ease both" },
  toastOk:   { background: "rgba(0,229,160,0.10)", border: "1px solid rgba(0,229,160,0.3)", color: "#00e5a0" },
  toastErr:  { background: "rgba(255,77,109,0.10)", border: "1px solid rgba(255,77,109,0.3)", color: "#ff4d6d" },
  layout:    { display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" },
  leftCol:   { display: "flex", flexDirection: "column", gap: "16px" },
  avatarCard:{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px" },
  avatarCircle:{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #2d7ef7, #00e5a0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "800", color: "#fff", marginBottom: "8px", boxShadow: "0 0 24px rgba(45,126,247,0.3)" },
  avatarName:{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0" },
  avatarEmail:{ fontSize: "13px", color: "#64748b" },
  premBadge: { background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: "100px", color: "#a78bfa", fontSize: "12px", fontWeight: "600", padding: "4px 12px" },
  freeBadge: { background: "rgba(100,116,139,0.1)", border: "1px solid #1a2540", borderRadius: "100px", color: "#64748b", fontSize: "12px", fontWeight: "600", padding: "4px 12px" },
  joinedText:{ fontSize: "11px", color: "#374151", marginTop: "4px" },
  upgradeBtn:{ width: "100%", marginTop: "8px", background: "linear-gradient(135deg,rgba(167,139,250,0.15),rgba(45,126,247,0.15))", border: "1px solid rgba(167,139,250,0.3)", borderRadius: "10px", color: "#a78bfa", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: "600", padding: "10px", cursor: "pointer" },
  statsCard: { background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "20px" },
  statsTitle:{ fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" },
  statRow:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" },
  statLeft:  { display: "flex", alignItems: "center", gap: "8px" },
  statIcon:  { fontSize: "16px" },
  statLabel: { fontSize: "13px", color: "#94a3b8" },
  statVal:   { fontSize: "14px", fontWeight: "700", fontFamily: "'JetBrains Mono',monospace" },
  quickCard: { background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" },
  quickLink: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "transparent", border: "none", borderBottom: "1px solid #1a2540", color: "#94a3b8", fontFamily: "'Poppins',sans-serif", fontSize: "13.5px", fontWeight: "500", cursor: "pointer", transition: "background 0.15s", textAlign: "left" },
  quickArrow:{ color: "#374151", fontSize: "14px" },
  rightCol:  { background: "#0e1525", border: "1px solid #1a2540", borderRadius: "20px", overflow: "hidden" },
  tabBar:    { display: "flex", borderBottom: "1px solid #1a2540" },
  tabBtn:    { flex: 1, padding: "16px", border: "none", fontFamily: "'Poppins',sans-serif", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" },
  tabContent:{ padding: "32px", animation: "slideIn 0.25s ease both" },
  secHdr:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  secTitle2: { fontSize: "18px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.01em" },
  editBtn:   { background: "rgba(45,126,247,0.1)", border: "1px solid rgba(45,126,247,0.25)", borderRadius: "9px", color: "#2d7ef7", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: "500", padding: "8px 16px", cursor: "pointer" },
  cancelBtn: { background: "transparent", border: "1px solid #1a2540", borderRadius: "9px", color: "#64748b", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: "500", padding: "8px 16px", cursor: "pointer" },
  editForm:  { display: "flex", flexDirection: "column", gap: "18px" },
  input:     { width: "100%", background: "#090e1a", border: "1px solid", borderRadius: "10px", color: "#e2e8f0", fontFamily: "'Poppins',sans-serif", fontSize: "14px", padding: "11px 14px", outline: "none", transition: "border-color 0.2s" },
  saveBtn:   { background: "#2d7ef7", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: "14px", fontWeight: "600", padding: "12px", cursor: "pointer", boxShadow: "0 4px 16px rgba(45,126,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center" },
  spinner:   { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  infoLabel: { fontSize: "11.5px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" },
  secBox:    { background: "#131d30", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px", marginBottom: "20px" },
  secName:   { fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" },
  secDesc:   { fontSize: "13px", color: "#64748b", marginBottom: "20px" },
  dangerCard:{ background: "rgba(255,77,109,0.04)", border: "1px solid rgba(255,77,109,0.15)", borderRadius: "16px", padding: "24px" },
  dangerTitle:{ fontSize: "15px", fontWeight: "700", color: "#ff4d6d", marginBottom: "16px" },
  dangerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" },
  dangerLabel:{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "3px" },
  dangerDesc: { fontSize: "12px", color: "#64748b" },
  dangerDivider:{ height: "1px", background: "rgba(255,77,109,0.1)", margin: "16px 0" },
  dangerOrange:{ background: "rgba(255,140,66,0.1)", border: "1px solid rgba(255,140,66,0.3)", borderRadius: "8px", color: "#ff8c42", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: "600", padding: "8px 18px", cursor: "pointer", flexShrink: 0 },
  dangerRed:   { background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "8px", color: "#ff4d6d", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: "600", padding: "8px 18px", cursor: "pointer", flexShrink: 0 },
};

export default ProfilePage;