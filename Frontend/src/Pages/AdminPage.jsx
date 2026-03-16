import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../Context/AuthContext";
import { adminService } from "../services/adminService";

const TABS = [
  { id: "overview",  label: "Overview",        icon: "📊" },
  { id: "users",     label: "Users",           icon: "👥" },
  { id: "markets",   label: "Market Controls", icon: "🎛️" },
  { id: "trades",    label: "Live Trades",     icon: "⚡" },
];

const AdminPage = () => {
  const navigate           = useNavigate();
  const { isAdmin }        = useAuth();
  const [tab,    setTab]   = useState("overview");
  const [stats,  setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(s => setStats(s))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  if (!isAdmin) {
    return (
      <div style={{ minHeight:"100vh", background:"#090e1a", fontFamily:"'Poppins',sans-serif", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"56px", marginBottom:"16px" }}>🔐</div>
          <div style={{ fontSize:"20px", fontWeight:"700", color:"#e2e8f0", marginBottom:"8px" }}>Access Denied</div>
          <div style={{ fontSize:"13px", color:"#64748b", marginBottom:"24px" }}>You need admin privileges to view this page.</div>
          <button onClick={() => navigate("/dashboard")} style={{ background:"#2d7ef7", border:"none", borderRadius:"10px", color:"#fff", fontFamily:"'Poppins',sans-serif", fontSize:"14px", fontWeight:"600", padding:"10px 24px", cursor:"pointer" }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#090e1a", fontFamily:"'Poppins',sans-serif", backgroundImage:"linear-gradient(rgba(45,126,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(45,126,247,0.03) 1px,transparent 1px)", backgroundSize:"48px 48px" }}>
      <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"36px 24px 80px" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"28px", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
              <h1 style={{ fontSize:"28px", fontWeight:"800", color:"#e2e8f0", letterSpacing:"-0.02em", margin:0 }}>Admin Panel</h1>
              <span style={{ fontSize:"10px", fontWeight:"700", padding:"3px 10px", borderRadius:"100px", background:"rgba(255,77,109,0.12)", color:"#ff4d6d", border:"1px solid rgba(255,77,109,0.25)", letterSpacing:"0.08em" }}>🔐 SUPER ADMIN</span>
            </div>
            <p style={{ fontSize:"13px", color:"#64748b", margin:0 }}>
              Platform management · {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={() => navigate("/dashboard")} style={{ background:"transparent", border:"1px solid #1a2540", borderRadius:"10px", color:"#64748b", fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:"600", padding:"8px 16px", cursor:"pointer" }}>← User View</button>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#0e1525", border:"1px solid #1a2540", borderRadius:"10px", padding:"8px 14px", fontSize:"12px" }}>
              <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#00e5a0", display:"inline-block", animation:"pulse 2s infinite" }} />
              <span style={{ color:"#00e5a0", fontWeight:"600" }}>System Online</span>
            </div>
          </div>
        </div>

        <AdminStats stats={stats} loading={statsLoading} />

        <div style={{ display:"flex", gap:"4px", background:"#0e1525", border:"1px solid #1a2540", borderRadius:"14px", padding:"5px", marginBottom:"20px", flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:"1 1 auto", background:tab===t.id?"#1a2540":"transparent", border:"none", borderRadius:"10px", color:tab===t.id?"#e2e8f0":"#64748b", fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:"600", padding:"10px 16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", transition:"all 0.15s", whiteSpace:"nowrap" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "users"    && <UsersTab />}
        {tab === "markets"  && <MarketsTab />}
        {tab === "trades"   && <TradesTab />}

      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.3)}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
};

const AdminStats = ({ stats, loading }) => {
  const cards = [
    { label:"Total Users",   value:stats?.totalUsers,   sub:stats?.newToday!=null?`+${stats.newToday} today`:"—",                                                               icon:"👥", color:"#2d7ef7" },
    { label:"Total Trades",  value:stats?.totalTrades,  sub:stats?.tradesPerHour!=null?`${stats.tradesPerHour}/hr`:"—",                                                         icon:"⚡", color:"#00e5a0" },
    { label:"Premium Users", value:stats?.premiumUsers, sub:stats?.totalUsers?`${((stats.premiumUsers/stats.totalUsers)*100).toFixed(1)}%`:"—",                                 icon:"⭐", color:"#ffd166" },
    { label:"ML Jobs Today", value:stats?.mlJobs,       sub:stats?.mlRunning!=null?`${stats.mlRunning} running`:"—",                                                            icon:"🤖", color:"#a78bfa" },
    { label:"Active Now",    value:stats?.activeNow,    sub:"online users",                                                                                                     icon:"🟢", color:"#00e5a0" },
    { label:"Halted Stocks", value:stats?.haltedStocks, sub:(stats?.haltedStocks??0)>0?"⚠️ needs review":"all clear",                                                          icon:"🔴", color:(stats?.haltedStocks??0)>0?"#ff4d6d":"#00e5a0" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"12px", marginBottom:"20px" }}>
      {cards.map(card => (
        <div key={card.label} style={{ background:"#0e1525", border:"1px solid #1a2540", borderRadius:"14px", padding:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
            <span style={{ fontSize:"10px", fontWeight:"600", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>{card.label}</span>
            <span style={{ fontSize:"18px" }}>{card.icon}</span>
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"20px", fontWeight:"700", color:loading?"#374151":card.color, marginBottom:"4px" }}>
            {loading?"—":card.value?.toLocaleString()??"—"}
          </div>
          <div style={{ fontSize:"11px", color:"#64748b" }}>{loading?"Loading...":card.sub}</div>
        </div>
      ))}
    </div>
  );
};

const OverviewTab = ({ stats }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
    <div style={{ background:"#0e1525", border:"1px solid #1a2540", borderRadius:"16px", padding:"24px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
        <span>📈</span>
        <span style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" }}>Platform Activity</span>
      </div>
      {[
        { label:"Trades last 24h",    value:stats?.trades24h??stats?.totalTrades??"—",  color:"#00e5a0" },
        { label:"New registrations",  value:stats?.newToday??"—",                        color:"#2d7ef7" },
        { label:"Premium upgrades",   value:stats?.premiumToday??"—",                    color:"#ffd166" },
        { label:"ML predictions run", value:stats?.mlJobs??"—",                          color:"#a78bfa" },
        { label:"Active users now",   value:stats?.activeNow??"—",                       color:"#94a3b8" },
      ].map((item,i,arr) => (
        <div key={item.label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<arr.length-1?"1px solid #1a2540":"none" }}>
          <span style={{ fontSize:"12px", color:"#64748b" }}>{item.label}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"13px", fontWeight:"700", color:item.color }}>{typeof item.value==="number"?item.value.toLocaleString():item.value}</span>
        </div>
      ))}
    </div>
    <div style={{ background:"#0e1525", border:"1px solid #1a2540", borderRadius:"16px", padding:"24px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
        <span>🖥️</span>
        <span style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" }}>System Health</span>
      </div>
      {["API Server","ML Service","Market Sync Worker","MongoDB","BullMQ / Redis","Yahoo Finance API"].map((svc,i,arr) => (
        <div key={svc} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:i<arr.length-1?"1px solid #1a2540":"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#00e5a0", display:"inline-block" }} />
            <span style={{ fontSize:"12px", color:"#94a3b8" }}>{svc}</span>
          </div>
          <span style={{ fontSize:"11px", color:"#00e5a0", fontWeight:"600" }}>Online</span>
        </div>
      ))}
    </div>
  </div>
);

const UsersTab = () => {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [roleFilter,setRoleFilter]=useState("ALL");
  const [confirm,  setConfirm]  = useState(null);
  const [actionLoading,setActionLoading]=useState(false);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:20 };
      if (search) params.search = search;
      if (roleFilter !== "ALL") {
        if (roleFilter === "BANNED") params.banned = true;
        else params.role = roleFilter.toLowerCase();
      }
      const res = await adminService.getAllUsers(params);
      setUsers(res?.users ?? []);
      setTotal(res?.total ?? 0);
    } catch(_) {}
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const doAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const { type, user } = confirm;
      if (type==="ban")     await adminService.banUser(user._id,"Admin action");
      if (type==="unban")   await adminService.unbanUser(user._id);
      if (type==="upgrade") await adminService.updateUserRole(user._id,"premium");
      if (type==="reset")   await adminService.resetBalance(user._id);
      setConfirm(null);
      load();
    } catch(_) {}
    finally { setActionLoading(false); }
  };

  return (
    <div style={{ background:"#0e1525", border:"1px solid #1a2540", borderRadius:"16px", overflow:"hidden" }}>
      <div style={{ padding:"20px 24px", borderBottom:"1px solid #1a2540", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span>👥</span>
          <span style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" }}>User Management — {total} users</span>
        </div>
        <div style={{ display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..."
            style={{ background:"#090e1a", border:"1px solid #1a2540", borderRadius:"9px", color:"#e2e8f0", fontFamily:"'Poppins',sans-serif", fontSize:"12px", padding:"7px 12px", outline:"none", width:"200px" }} />
          <div style={{ display:"flex", background:"#090e1a", border:"1px solid #1a2540", borderRadius:"9px", padding:"3px", gap:"2px" }}>
            {["ALL","PREMIUM","FREE","BANNED"].map(f => (
              <button key={f} onClick={()=>{setRoleFilter(f);setPage(1);}}
                style={{ background:roleFilter===f?"#1a2540":"transparent", border:"none", borderRadius:"7px", color:roleFilter===f?"#e2e8f0":"#64748b", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:"600", padding:"4px 10px", cursor:"pointer" }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 80px 120px 80px 80px 100px 160px", gap:"8px", padding:"10px 24px", background:"#0a1020", borderBottom:"1px solid #1a2540" }}>
        {["User","Email","Role","Balance","Trades","Win%","Status","Actions"].map(h => (
          <span key={h} style={{ fontSize:"10px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</span>
        ))}
      </div>

      {loading ? Array.from({length:5}).map((_,i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 80px 120px 80px 80px 100px 160px", gap:"8px", padding:"14px 24px", borderBottom:"1px solid #1a2540" }}>
          {[120,160,60,80,40,40,60,120].map((w,j) => (
            <div key={j} style={{ height:"12px", width:`${w}px`, background:"#1a2540", borderRadius:"4px", animation:"shimmer 1.5s infinite" }} />
          ))}
        </div>
      )) : users.map(user => {
        const isBanned = user.isBanned ?? user.status==="banned";
        return (
          <div key={user._id} style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 80px 120px 80px 80px 100px 160px", gap:"8px", alignItems:"center", padding:"12px 24px", borderBottom:"1px solid #1a2540", opacity:isBanned?0.6:1, transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#131d30"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,#2d7ef7,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color:"#fff", flexShrink:0 }}>
                {user.name?.charAt(0)??"?"}
              </div>
              <span style={{ fontSize:"13px", fontWeight:"600", color:"#e2e8f0" }}>{user.name}</span>
            </div>
            <span style={{ fontSize:"11px", color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:"3px", fontSize:"10px", fontWeight:"700", padding:"3px 8px", borderRadius:"6px", background:user.role==="premium"?"rgba(255,209,102,0.1)":"rgba(100,116,139,0.1)", color:user.role==="premium"?"#ffd166":"#64748b", border:user.role==="premium"?"1px solid rgba(255,209,102,0.25)":"1px solid rgba(100,116,139,0.2)" }}>
              {user.role==="premium"?"⭐":"👤"} {user.role}
            </span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", color:"#e2e8f0", fontWeight:"600" }}>
              ₹{(user.cashBalance??user.balance??0).toLocaleString("en-IN")}
            </span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", color:"#94a3b8" }}>{user.totalTrades??user.trades??0}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", color:(user.winRate??0)>=60?"#00e5a0":(user.winRate??0)>=40?"#ffd166":"#ff4d6d" }}>{user.winRate??0}%</span>
            <span style={{ fontSize:"10px", fontWeight:"700", padding:"3px 8px", borderRadius:"6px", background:!isBanned?"rgba(0,229,160,0.1)":"rgba(255,77,109,0.1)", color:!isBanned?"#00e5a0":"#ff4d6d", border:!isBanned?"1px solid rgba(0,229,160,0.2)":"1px solid rgba(255,77,109,0.2)" }}>
              {!isBanned?"● Active":"✕ Banned"}
            </span>
            <div style={{ display:"flex", gap:"4px" }}>
              {user.role!=="premium"&&user.role!=="admin"&&(
                <button onClick={()=>setConfirm({type:"upgrade",user})} title="Upgrade"
                  style={{ background:"rgba(255,209,102,0.1)", border:"1px solid rgba(255,209,102,0.2)", borderRadius:"6px", color:"#ffd166", fontSize:"11px", fontWeight:"600", padding:"4px 8px", cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>⭐</button>
              )}
              <button onClick={()=>setConfirm({type:"reset",user})} title="Reset Balance"
                style={{ background:"rgba(45,126,247,0.1)", border:"1px solid rgba(45,126,247,0.2)", borderRadius:"6px", color:"#2d7ef7", fontSize:"11px", fontWeight:"600", padding:"4px 8px", cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>↺</button>
              {user.role!=="admin"&&(
                <button onClick={()=>setConfirm({type:isBanned?"unban":"ban",user})}
                  style={{ background:isBanned?"rgba(0,229,160,0.1)":"rgba(255,77,109,0.1)", border:`1px solid ${isBanned?"rgba(0,229,160,0.2)":"rgba(255,77,109,0.2)"}`, borderRadius:"6px", color:isBanned?"#00e5a0":"#ff4d6d", fontSize:"11px", fontWeight:"600", padding:"4px 8px", cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                  {isBanned?"Unban":"Ban"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {!loading&&total>20&&(
        <div style={{ padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #1a2540" }}>
          <span style={{ fontSize:"12px", color:"#64748b" }}>Page {page} · {total} total</span>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ background:"transparent", border:"1px solid #1a2540", borderRadius:"8px", color:page===1?"#374151":"#94a3b8", fontFamily:"'Poppins',sans-serif", fontSize:"12px", padding:"6px 14px", cursor:page===1?"not-allowed":"pointer" }}>← Prev</button>
            <button onClick={()=>setPage(p=>p+1)} disabled={users.length<20}
              style={{ background:"transparent", border:"1px solid #1a2540", borderRadius:"8px", color:users.length<20?"#374151":"#94a3b8", fontFamily:"'Poppins',sans-serif", fontSize:"12px", padding:"6px 14px", cursor:users.length<20?"not-allowed":"pointer" }}>Next →</button>
          </div>
        </div>
      )}

      {confirm&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}
          onClick={()=>setConfirm(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#0e1525", border:"1px solid #1a2540", borderRadius:"16px", padding:"28px", width:"360px" }}>
            <div style={{ fontSize:"32px", textAlign:"center", marginBottom:"12px" }}>
              {confirm.type==="ban"?"🚫":confirm.type==="unban"?"🔓":confirm.type==="upgrade"?"⭐":"↺"}
            </div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#e2e8f0", textAlign:"center", marginBottom:"6px" }}>
              {confirm.type==="ban"?"Ban User?":confirm.type==="unban"?"Unban User?":confirm.type==="upgrade"?"Upgrade to Premium?":"Reset Balance?"}
            </div>
            <div style={{ fontSize:"12px", color:"#64748b", textAlign:"center", marginBottom:"24px" }}>{confirm.user.name} — {confirm.user.email}</div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={()=>setConfirm(null)} style={{ flex:1, background:"transparent", border:"1px solid #1a2540", borderRadius:"10px", color:"#64748b", fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:"600", padding:"10px", cursor:"pointer" }}>Cancel</button>
              <button onClick={doAction} disabled={actionLoading}
                style={{ flex:1, background:confirm.type==="ban"?"rgba(255,77,109,0.15)":"rgba(45,126,247,0.15)", border:`1px solid ${confirm.type==="ban"?"rgba(255,77,109,0.3)":"rgba(45,126,247,0.3)"}`, borderRadius:"10px", color:confirm.type==="ban"?"#ff4d6d":"#2d7ef7", fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:"700", padding:"10px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {actionLoading?<span style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.2)", borderTop:"2px solid currentColor", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} />:"Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MarketsTab = () => {
  const [stocks,  setStocks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [haltModal, setHaltModal]   = useState(null);
  const [haltReason,setHaltReason]  = useState("");
  const [actionLoading,setActionLoading] = useState(false);

  useEffect(() => {
    adminService.getAllStocks()
      .then(res=>setStocks(res?.stocks??[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  const toggleHalt = async (symbol, currentlyHalted, reason="") => {
    setActionLoading(true);
    try {
      await adminService.haltStock(symbol, !currentlyHalted, reason);
      setStocks(prev=>prev.map(s=>s.symbol===symbol?{...s,isHalted:!currentlyHalted,haltReason:!currentlyHalted?reason:null}:s));
      setHaltModal(null); setHaltReason("");
    } catch(_) {}
    finally { setActionLoading(false); }
  };

  const haltedCount = stocks.filter(s=>s.isHalted).length;

  return (
    <div style={{ background:"#0e1525", border:"1px solid #1a2540", borderRadius:"16px", overflow:"hidden" }}>
      <div style={{ padding:"20px 24px", borderBottom:"1px solid #1a2540", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span>🎛️</span>
          <span style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" }}>Market Controls</span>
          {haltedCount>0&&<span style={{ fontSize:"10px", fontWeight:"700", padding:"2px 8px", borderRadius:"6px", background:"rgba(255,77,109,0.12)", color:"#ff4d6d", border:"1px solid rgba(255,77,109,0.25)" }}>{haltedCount} halted</span>}
        </div>
        <span style={{ fontSize:"11px", color:"#64748b" }}>Circuit breaker auto-triggers at ±10%</span>
      </div>

      {loading ? (
        <div style={{ padding:"40px", textAlign:"center", color:"#64748b", fontSize:"13px" }}>Loading stocks...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", padding:"20px" }}>
          {stocks.map(stock => {
            const changePct = stock.priceChangePct??stock.changePct??0;
            const isUp = changePct>=0;
            const short = stock.symbol.replace(".NS","");
            return (
              <div key={stock.symbol} style={{ background:stock.isHalted?"rgba(255,77,109,0.04)":"#131d30", border:`1px solid ${stock.isHalted?"rgba(255,77,109,0.25)":"#1a2540"}`, borderRadius:"12px", padding:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px" }}>
                  <div>
                    <div style={{ fontSize:"13px", fontWeight:"700", color:"#e2e8f0" }}>{short}</div>
                    <div style={{ fontSize:"10px", color:"#64748b", marginTop:"1px" }}>{stock.companyName??stock.name}</div>
                  </div>
                  {stock.isHalted&&<span style={{ fontSize:"9px", fontWeight:"700", padding:"2px 6px", borderRadius:"4px", background:"rgba(255,77,109,0.12)", color:"#ff4d6d", border:"1px solid rgba(255,77,109,0.25)" }}>HALTED</span>}
                </div>
                <div style={{ marginBottom:"10px" }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"14px", fontWeight:"600", color:"#e2e8f0" }}>₹{(stock.currentPrice??0).toLocaleString("en-IN")}</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:isUp?"#00e5a0":"#ff4d6d", marginTop:"2px" }}>{isUp?"+":""}{changePct.toFixed(2)}%</div>
                </div>
                {stock.isHalted&&stock.haltReason&&<div style={{ fontSize:"10px", color:"#ff4d6d", marginBottom:"8px", padding:"4px 8px", background:"rgba(255,77,109,0.08)", borderRadius:"6px" }}>{stock.haltReason}</div>}
                <button onClick={()=>stock.isHalted?toggleHalt(stock.symbol,true):setHaltModal(stock)} disabled={actionLoading}
                  style={{ width:"100%", background:stock.isHalted?"rgba(0,229,160,0.1)":"rgba(255,77,109,0.1)", border:`1px solid ${stock.isHalted?"rgba(0,229,160,0.25)":"rgba(255,77,109,0.25)"}`, borderRadius:"8px", color:stock.isHalted?"#00e5a0":"#ff4d6d", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:"700", padding:"7px", cursor:"pointer" }}>
                  {stock.isHalted?"▶ Resume Trading":"⏸ Halt Trading"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {haltModal&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}
          onClick={()=>setHaltModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#0e1525", border:"1px solid rgba(255,77,109,0.3)", borderRadius:"16px", padding:"28px", width:"380px" }}>
            <div style={{ fontSize:"32px", textAlign:"center", marginBottom:"12px" }}>⏸</div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#e2e8f0", textAlign:"center", marginBottom:"6px" }}>Halt {haltModal.symbol.replace(".NS","")}?</div>
            <div style={{ fontSize:"12px", color:"#64748b", textAlign:"center", marginBottom:"20px" }}>This will prevent all users from trading this stock</div>
            <div style={{ marginBottom:"16px" }}>
              <label style={{ fontSize:"11px", fontWeight:"600", color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:"8px" }}>Halt Reason</label>
              <input value={haltReason} onChange={e=>setHaltReason(e.target.value)} placeholder="e.g. High volatility, News event..."
                style={{ width:"100%", background:"#090e1a", border:"1px solid #1a2540", borderRadius:"9px", color:"#e2e8f0", fontFamily:"'Poppins',sans-serif", fontSize:"13px", padding:"10px 12px", outline:"none" }} />
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={()=>setHaltModal(null)} style={{ flex:1, background:"transparent", border:"1px solid #1a2540", borderRadius:"10px", color:"#64748b", fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:"600", padding:"10px", cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>toggleHalt(haltModal.symbol,false,haltReason||"Manual admin halt")} disabled={actionLoading}
                style={{ flex:1, background:"rgba(255,77,109,0.15)", border:"1px solid rgba(255,77,109,0.3)", borderRadius:"10px", color:"#ff4d6d", fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:"700", padding:"10px", cursor:"pointer" }}>
                Confirm Halt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TradesTab = () => {
  const [trades,  setTrades]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused,  setPaused]  = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getRecentTrades({ limit:20 });
      setTrades(res?.trades??[]);
    } catch(_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [paused, load]);

  return (
    <div style={{ background:"#0e1525", border:"1px solid #1a2540", borderRadius:"16px", overflow:"hidden" }}>
      <div style={{ padding:"16px 24px", borderBottom:"1px solid #1a2540", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span>⚡</span>
          <span style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" }}>Recent Trades</span>
          {!paused&&<span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#00e5a0", display:"inline-block", animation:"pulse 2s infinite" }} />}
        </div>
        <button onClick={()=>setPaused(p=>!p)}
          style={{ background:paused?"rgba(0,229,160,0.1)":"rgba(255,209,102,0.1)", border:`1px solid ${paused?"rgba(0,229,160,0.25)":"rgba(255,209,102,0.25)"}`, borderRadius:"8px", color:paused?"#00e5a0":"#ffd166", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:"600", padding:"5px 12px", cursor:"pointer" }}>
          {paused?"▶ Resume":"⏸ Pause"}
        </button>
      </div>
      <div style={{ maxHeight:"400px", overflowY:"auto" }}>
        {loading ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#64748b", fontSize:"13px" }}>Loading trades...</div>
        ) : trades.length===0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#64748b", fontSize:"13px" }}>No trades yet.</div>
        ) : trades.map((trade,i) => {
          const isBuy  = (trade.type??trade.orderType)==="BUY";
          const symbol = (trade.symbol??trade.stock?.symbol??"—").replace(".NS","");
          const userName = trade.user?.name??trade.userName??"User";
          const qty    = trade.quantity??trade.qty??0;
          const price  = trade.executedPrice??trade.price??0;
          const total  = trade.totalAmount??trade.total??(qty*price);
          const time   = trade.createdAt?new Date(trade.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"—";
          return (
            <div key={trade._id??i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 24px", borderBottom:"1px solid #1a2540", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#131d30"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontSize:"11px", fontWeight:"600", color:"#64748b", minWidth:"80px" }}>{userName}</span>
                <span style={{ fontSize:"10px", fontWeight:"700", padding:"2px 7px", borderRadius:"5px", background:isBuy?"rgba(0,229,160,0.1)":"rgba(255,77,109,0.1)", color:isBuy?"#00e5a0":"#ff4d6d", border:`1px solid ${isBuy?"rgba(0,229,160,0.2)":"rgba(255,77,109,0.2)"}` }}>
                  {isBuy?"BUY":"SELL"}
                </span>
                <span style={{ fontSize:"12px", fontWeight:"600", color:"#e2e8f0" }}>{qty}×</span>
                <span style={{ fontSize:"12px", fontWeight:"700", color:"#94a3b8" }}>{symbol}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"#64748b" }}>@ ₹{price.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", fontWeight:"700", color:isBuy?"#ff4d6d":"#00e5a0" }}>
                  {isBuy?"-":"+"}₹{total.toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize:"10px", color:"#374151" }}>{time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPage;