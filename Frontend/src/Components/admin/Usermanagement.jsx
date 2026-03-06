import { useState } from "react";

const MOCK_USERS = [
  { id: 1,  name: "John Doe",       email: "john@example.com",    role: "premium", balance: 112430, trades: 48, winRate: 62, joined: "Jan 5, 2025",  status: "active"  },
  { id: 2,  name: "Priya Sharma",   email: "priya@example.com",   role: "premium", balance: 234100, trades: 124,winRate: 71, joined: "Dec 12, 2024", status: "active"  },
  { id: 3,  name: "Rahul Verma",    email: "rahul@example.com",   role: "free",    balance: 98200,  trades: 12, winRate: 41, joined: "Feb 1, 2025",  status: "active"  },
  { id: 4,  name: "Alice Chen",     email: "alice@example.com",   role: "premium", balance: 452000, trades: 312,winRate: 78, joined: "Nov 3, 2024",  status: "active"  },
  { id: 5,  name: "Mohammed Ali",   email: "mali@example.com",    role: "free",    balance: 45000,  trades: 4,  winRate: 25, joined: "Mar 1, 2025",  status: "active"  },
  { id: 6,  name: "Sara Johnson",   email: "sara@example.com",    role: "free",    balance: 71200,  trades: 21, winRate: 52, joined: "Jan 20, 2025", status: "banned"  },
  { id: 7,  name: "Dev Patel",      email: "dev@example.com",     role: "premium", balance: 189000, trades: 89, winRate: 65, joined: "Oct 15, 2024", status: "active"  },
  { id: 8,  name: "Emma Wilson",    email: "emma@example.com",    role: "free",    balance: 100000, trades: 0,  winRate: 0,  joined: "Mar 4, 2025",  status: "active"  },
];

const UserManagement = () => {
  const [users,    setUsers]    = useState(MOCK_USERS);
  const [search,   setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [confirmAction, setConfirmAction] = useState(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "ALL" || u.role.toUpperCase() === roleFilter || (roleFilter === "BANNED" && u.status === "banned");
    return matchSearch && matchRole;
  });

  const toggleBan = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "banned" ? "active" : "banned" } : u));
    setConfirmAction(null);
  };

  const upgradePremium = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: "premium" } : u));
    setConfirmAction(null);
  };

  const resetPortfolio = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, balance: 100000, trades: 0, winRate: 0 } : u));
    setConfirmAction(null);
  };

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a2540", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>👥</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            User Management — {filtered.length} users
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..."
            style={{ background: "#090e1a", border: "1px solid #1a2540", borderRadius: "9px", color: "#e2e8f0", fontFamily: "'Poppins', sans-serif", fontSize: "12px", padding: "7px 12px", outline: "none", width: "200px" }}
          />
          {/* Role filter */}
          <div style={{ display: "flex", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "9px", padding: "3px", gap: "2px" }}>
            {["ALL", "PREMIUM", "FREE", "BANNED"].map(f => (
              <button key={f} onClick={() => setRoleFilter(f)} style={{ background: roleFilter === f ? "#1a2540" : "transparent", border: "none", borderRadius: "7px", color: roleFilter === f ? "#e2e8f0" : "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: "600", padding: "4px 10px", cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 120px 80px 80px 100px 160px", gap: "8px", padding: "10px 24px", background: "#0a1020", borderBottom: "1px solid #1a2540" }}>
        {["User", "Email", "Role", "Balance", "Trades", "Win%", "Status", "Actions"].map(h => (
          <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {filtered.map((user) => (
        <div
          key={user.id}
          style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 120px 80px 80px 100px 160px", gap: "8px", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #1a2540", transition: "background 0.15s", opacity: user.status === "banned" ? 0.6 : 1 }}
          onMouseEnter={e => e.currentTarget.style.background = "#131d30"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {/* Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #2d7ef7, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
              {user.name.charAt(0)}
            </div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{user.name}</span>
          </div>

          {/* Email */}
          <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>

          {/* Role */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px",
            background: user.role === "premium" ? "rgba(255,209,102,0.1)" : "rgba(100,116,139,0.1)",
            color:      user.role === "premium" ? "#ffd166"               : "#64748b",
            border:     user.role === "premium" ? "1px solid rgba(255,209,102,0.25)" : "1px solid rgba(100,116,139,0.2)",
          }}>
            {user.role === "premium" ? "⭐" : "👤"} {user.role}
          </span>

          {/* Balance */}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#e2e8f0", fontWeight: "600" }}>
            ₹{user.balance.toLocaleString("en-IN")}
          </span>

          {/* Trades */}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>{user.trades}</span>

          {/* Win Rate */}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: user.winRate >= 60 ? "#00e5a0" : user.winRate >= 40 ? "#ffd166" : "#ff4d6d" }}>
            {user.winRate}%
          </span>

          {/* Status */}
          <span style={{
            fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px",
            background: user.status === "active" ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
            color:      user.status === "active" ? "#00e5a0"               : "#ff4d6d",
            border:     user.status === "active" ? "1px solid rgba(0,229,160,0.2)" : "1px solid rgba(255,77,109,0.2)",
          }}>
            {user.status === "active" ? "● Active" : "✕ Banned"}
          </span>

          {/* Actions */}
          <div style={{ display: "flex", gap: "4px" }}>
            {user.role === "free" && (
              <button
                onClick={() => setConfirmAction({ type: "upgrade", user })}
                title="Upgrade to Premium"
                style={{ background: "rgba(255,209,102,0.1)", border: "1px solid rgba(255,209,102,0.2)", borderRadius: "6px", color: "#ffd166", fontSize: "11px", fontWeight: "600", padding: "4px 8px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
              >⭐</button>
            )}
            <button
              onClick={() => setConfirmAction({ type: "reset", user })}
              title="Reset Portfolio"
              style={{ background: "rgba(45,126,247,0.1)", border: "1px solid rgba(45,126,247,0.2)", borderRadius: "6px", color: "#2d7ef7", fontSize: "11px", fontWeight: "600", padding: "4px 8px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
            >↺</button>
            <button
              onClick={() => setConfirmAction({ type: "ban", user })}
              title={user.status === "banned" ? "Unban" : "Ban"}
              style={{ background: user.status === "banned" ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)", border: `1px solid ${user.status === "banned" ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`, borderRadius: "6px", color: user.status === "banned" ? "#00e5a0" : "#ff4d6d", fontSize: "11px", fontWeight: "600", padding: "4px 8px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
            >{user.status === "banned" ? "Unban" : "Ban"}</button>
          </div>
        </div>
      ))}

      {/* Confirm modal */}
      {confirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmAction(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "28px", width: "360px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>
              {confirmAction.type === "ban" ? (confirmAction.user.status === "banned" ? "🔓" : "🚫") : confirmAction.type === "upgrade" ? "⭐" : "↺"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0", textAlign: "center", marginBottom: "8px" }}>
              {confirmAction.type === "ban"     ? (confirmAction.user.status === "banned" ? "Unban User?" : "Ban User?")
               : confirmAction.type === "upgrade" ? "Upgrade to Premium?"
               : "Reset Portfolio?"}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center", marginBottom: "24px" }}>
              {confirmAction.user.name} — {confirmAction.user.email}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setConfirmAction(null)} style={{ flex: 1, background: "transparent", border: "1px solid #1a2540", borderRadius: "10px", color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: "600", padding: "10px", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === "ban")     toggleBan(confirmAction.user.id);
                  if (confirmAction.type === "upgrade") upgradePremium(confirmAction.user.id);
                  if (confirmAction.type === "reset")   resetPortfolio(confirmAction.user.id);
                }}
                style={{ flex: 1, background: confirmAction.type === "ban" && confirmAction.user.status !== "banned" ? "rgba(255,77,109,0.15)" : "rgba(45,126,247,0.15)", border: `1px solid ${confirmAction.type === "ban" && confirmAction.user.status !== "banned" ? "rgba(255,77,109,0.3)" : "rgba(45,126,247,0.3)"}`, borderRadius: "10px", color: confirmAction.type === "ban" && confirmAction.user.status !== "banned" ? "#ff4d6d" : "#2d7ef7", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: "700", padding: "10px", cursor: "pointer" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;