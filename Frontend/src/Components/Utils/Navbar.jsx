import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* ============================================================
   TRADESPHERE NAVBAR
   
   GUEST  → Login + Get Started buttons
   LOGGED IN → Hamburger menu (right side)
     - Premium user menu: Dashboard, Markets, Watchlist, Predictions, Portfolio, Leaderboard
     - Normal user menu:  Dashboard, Markets, About Us, Contact Us
   
   Home page center links: Home · How It Works · Leaderboard
   ============================================================ */

const Navbar = () => {
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const menuRef                   = useRef(null);

  // ── Replace with useAuth() ────────────────────────────────
  const user = { name: "John", role: "premium" };
  // const user = { name: "Alex", role: "user" };
  // const user = null;

  const isHomePage = location.pathname === "/";

  // ── Scroll listener ───────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close menu on outside click ───────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Close menu on route change ────────────────────────────
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // ── Smooth scroll ─────────────────────────────────────────
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  // ── Home center links ─────────────────────────────────────
  const homeLinks = [
    { label: "Home",         action: () => scrollTo("hero")                 },
    { label: "How It Works", action: () => scrollTo("how-it-works")         },
    { label: "Leaderboard",  action: () => scrollTo("leaderboard-preview")  },
  ];

  // ── Hamburger menu links based on role ────────────────────
  const premiumMenuLinks = [
    { label: "Dashboard",   path: "/dashboard",   icon: "🗂️",  desc: "Your overview"          },
    { label: "Markets",     path: "/market",      icon: "📊",  desc: "Live stock prices"       },
    { label: "Watchlist",   path: "/watchlist",   icon: "⭐",  desc: "Saved stocks"            },
    { label: "Predictions", path: "/predictions", icon: "🤖",  desc: "AI price forecasts"      },
    { label: "Portfolio",   path: "/portfolio",   icon: "💼",  desc: "Your holdings & P&L"     },
    { label: "Leaderboard", path: "/leaderboard", icon: "🏆",  desc: "Top traders ranking"     },
    { label: "About Us",    path: "/about",       icon: "ℹ️",  desc: "Our story"               },
    { label: "Contact Us",  path: "/contact",     icon: "✉️",  desc: "Get in touch"            },
  ];

  const normalMenuLinks = [
    { label: "Dashboard",   path: "/dashboard",   icon: "🗂️",  desc: "Your overview"          },
    { label: "Markets",     path: "/market",      icon: "📊",  desc: "Live stock prices"       },
    { label: "About Us",    path: "/about",       icon: "ℹ️",  desc: "Our story"               },
    { label: "Contact Us",  path: "/contact",     icon: "✉️",  desc: "Get in touch"            },
  ];

  const menuLinks = user?.role === "premium" ? premiumMenuLinks : normalMenuLinks;

  const handleLogout = () => {
    setMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <nav style={{
        ...s.nav,
        background:   scrolled ? "rgba(9,14,26,0.95)" : "rgba(9,14,26,0.75)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.09)"
          : "1px solid rgba(255,255,255,0.04)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.45)" : "none",
      }}>
        <div style={s.inner}>

          {/* ── LEFT — Logo ──────────────────────────────── */}
          <div style={s.logo} onClick={() => navigate("/")}>
            <div style={s.logoBox}>📈</div>
            <span style={s.logoText}>TradeSphere</span>
          </div>

          {/* ── CENTER — Home anchor links ───────────────── */}
          {isHomePage && (
            <div style={s.centerLinks}>
              {homeLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={l.action}
                  style={s.centerLink}
                  onMouseEnter={e => e.currentTarget.style.color = "#e2e8f0"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {/* ── RIGHT ────────────────────────────────────── */}
          <div style={s.right}>

            {/* GUEST — Login + Get Started */}
            {!user && (
              <div style={s.authBtns}>
                <button
                  onClick={() => navigate("/auth/login")}
                  style={s.loginBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#2d7ef7";
                    e.currentTarget.style.color       = "#2d7ef7";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#1a2540";
                    e.currentTarget.style.color       = "#94a3b8";
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/auth/signup")}
                  style={s.getStartedBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#4a90f5";
                    e.currentTarget.style.boxShadow  = "0 0 20px rgba(45,126,247,0.5)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#2d7ef7";
                    e.currentTarget.style.boxShadow  = "0 0 12px rgba(45,126,247,0.3)";
                  }}
                >
                  Get Started →
                </button>
              </div>
            )}

            {/* LOGGED IN — Hamburger */}
            {user && (
              <div style={s.hamburgerWrap} ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    ...s.hamburgerBtn,
                    background: menuOpen ? "rgba(45,126,247,0.12)" : "rgba(255,255,255,0.04)",
                    borderColor: menuOpen ? "rgba(45,126,247,0.35)" : "#1a2540",
                  }}
                >
                  {/* Avatar */}
                  <div style={s.hamAvatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <span style={s.hamName}>{user.name}</span>

                  {/* Role badge */}
                  {user.role === "premium"
                    ? <span style={s.premiumBadge}>⭐ Premium</span>
                    : <span style={s.normalBadge}>Free</span>
                  }

                  {/* Chevron */}
                  <span style={{
                    ...s.chevron,
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}>
                    ▾
                  </span>
                </button>

                {/* ── Dropdown menu ── */}
                {menuOpen && (
                  <div style={s.dropdown}>

                    {/* User info header */}
                    <div style={s.dropHeader}>
                      <div style={s.dropAvatar}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={s.dropName}>{user.name}</div>
                        <div onClick={()=>navigate("/my-profile")} style={s.dropRole}>
                          {user.role === "premium" ? "⭐ Premium Account" : "👤 Free Account"}
                        </div>
                      </div>
                    </div>

                    <div style={s.dropDivider} />

                    {/* Menu links */}
                    {menuLinks.map((l) => (
                      <button
                        key={l.label}
                        onClick={() => navigate(l.path)}
                        style={{
                          ...s.dropLink,
                          background: isActive(l.path)
                            ? "rgba(45,126,247,0.08)"
                            : "transparent",
                          borderLeft: isActive(l.path)
                            ? "2px solid #2d7ef7"
                            : "2px solid transparent",
                        }}
                        onMouseEnter={e => {
                          if (!isActive(l.path))
                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={e => {
                          if (!isActive(l.path))
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={s.dropIcon}>{l.icon}</span>
                        <div style={s.dropLinkText}>
                          <span style={{
                            ...s.dropLinkLabel,
                            color: isActive(l.path) ? "#2d7ef7" : "#e2e8f0",
                          }}>
                            {l.label}
                          </span>
                          <span style={s.dropLinkDesc}>{l.desc}</span>
                        </div>
                        {isActive(l.path) && (
                          <span style={s.dropActiveDot}>●</span>
                        )}
                      </button>
                    ))}

                    <div style={s.dropDivider} />

                    {/* Upgrade CTA for normal users */}
                    {user.role !== "premium" && (
                      <>
                        <button
                          onClick={() => { navigate("/upgrade"); setMenuOpen(false); }}
                          style={s.upgradeBtn}
                        >
                          ⭐ Upgrade to Premium
                        </button>
                        <div style={s.dropDivider} />
                      </>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      style={s.logoutBtn}
                      onMouseEnter={e => e.currentTarget.style.color = "#ff4d6d"}
                      onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                    >
                      <span>🚪</span> Logout
                    </button>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: "66px" }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  );
};

/* ============================================================
   STYLES
   ============================================================ */
const s = {
  nav: {
    position:             "fixed",
    top:                  0, left: 0, right: 0,
    zIndex:               1000,
    backdropFilter:       "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    transition:           "all 0.3s ease",
    fontFamily:           "'Poppins', system-ui, sans-serif",
  },
  inner: {
    maxWidth:       "1200px",
    margin:         "0 auto",
    padding:        "0 24px",
    height:         "66px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    gap:            "20px",
  },

  /* Logo */
  logo: {
    display: "flex", alignItems: "center",
    gap: "9px", cursor: "pointer", flexShrink: 0,
  },
  logoBox: {
    width: "36px", height: "36px",
    background: "rgba(45,126,247,0.12)",
    border: "1px solid rgba(45,126,247,0.25)",
    borderRadius: "9px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px",
  },
  logoText: {
    fontSize: "17px", fontWeight: "700",
    color: "#e2e8f0", letterSpacing: "-0.02em",
  },

  /* Center home links */
  centerLinks: {
    display: "flex", alignItems: "center",
    gap: "4px", flex: 1, justifyContent: "center",
  },
  centerLink: {
    background: "none", border: "none",
    fontSize: "14px", fontFamily: "'Poppins', sans-serif",
    fontWeight: "500", color: "#94a3b8",
    padding: "8px 16px", cursor: "pointer",
    borderRadius: "8px", transition: "color 0.2s",
  },

  /* Right */
  right: { display: "flex", alignItems: "center", flexShrink: 0 },

  /* Guest buttons */
  authBtns: { display: "flex", alignItems: "center", gap: "10px" },
  loginBtn: {
    background: "transparent", border: "1px solid #1a2540",
    borderRadius: "9px", color: "#94a3b8",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13.5px", fontWeight: "500",
    padding: "8px 18px", cursor: "pointer", transition: "all 0.2s ease",
  },
  getStartedBtn: {
    background: "#2d7ef7", border: "none",
    borderRadius: "9px", color: "#fff",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13.5px", fontWeight: "600",
    padding: "8px 18px", cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 0 12px rgba(45,126,247,0.3)",
  },

  /* Hamburger trigger */
  hamburgerWrap: { position: "relative" },
  hamburgerBtn: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1a2540",
    borderRadius: "12px", padding: "7px 14px",
    cursor: "pointer", transition: "all 0.2s ease",
    fontFamily: "'Poppins', sans-serif",
  },
  hamAvatar: {
    width: "30px", height: "30px", borderRadius: "50%",
    background: "linear-gradient(135deg, #2d7ef7, #00e5a0)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0,
  },
  hamName: {
    fontSize: "13.5px", fontWeight: "600", color: "#e2e8f0",
  },
  premiumBadge: {
    background: "rgba(167,139,250,0.12)",
    border: "1px solid rgba(167,139,250,0.3)",
    borderRadius: "100px", color: "#a78bfa",
    fontSize: "10.5px", fontWeight: "600",
    padding: "2px 9px", letterSpacing: "0.04em",
  },
  normalBadge: {
    background: "rgba(100,116,139,0.12)",
    border: "1px solid rgba(100,116,139,0.25)",
    borderRadius: "100px", color: "#64748b",
    fontSize: "10.5px", fontWeight: "600",
    padding: "2px 9px",
  },
  chevron: {
    fontSize: "12px", color: "#64748b",
    transition: "transform 0.25s ease",
    lineHeight: "1",
  },

  /* Dropdown */
  dropdown: {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    width: "280px",
    background: "#0e1525",
    border: "1px solid #1a2540",
    borderRadius: "16px",
    boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,126,247,0.08)",
    overflow: "hidden",
    animation: "dropIn 0.2s ease both",
    zIndex: 100,
  },

  /* Dropdown header */
  dropHeader: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px 18px",
    background: "rgba(45,126,247,0.04)",
  },
  dropAvatar: {
    width: "40px", height: "40px", borderRadius: "50%",
    background: "linear-gradient(135deg, #2d7ef7, #00e5a0)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "16px", fontWeight: "700", color: "#fff", flexShrink: 0,
  },
  dropName: { fontSize: "14px", fontWeight: "600", color: "#e2e8f0" },
  dropRole: { fontSize: "12px", color: "#64748b", marginTop: "2px" },

  dropDivider: { height: "1px", background: "#1a2540", margin: "0" },

  /* Dropdown links */
  dropLink: {
    width: "100%", display: "flex", alignItems: "center",
    gap: "12px", padding: "11px 18px",
    border: "none", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.15s ease", textAlign: "left",
  },
  dropIcon:  { fontSize: "18px", flexShrink: 0, width: "24px", textAlign: "center" },
  dropLinkText: { display: "flex", flexDirection: "column", gap: "1px", flex: 1 },
  dropLinkLabel: { fontSize: "13.5px", fontWeight: "500" },
  dropLinkDesc:  { fontSize: "11px", color: "#64748b" },
  dropActiveDot: { fontSize: "8px", color: "#2d7ef7", marginLeft: "auto" },

  /* Upgrade CTA */
  upgradeBtn: {
    width: "calc(100% - 36px)", margin: "10px 18px",
    background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(45,126,247,0.15))",
    border: "1px solid rgba(167,139,250,0.3)",
    borderRadius: "10px", color: "#a78bfa",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px", fontWeight: "600",
    padding: "10px", cursor: "pointer",
    transition: "all 0.2s ease",
  },

  /* Logout */
  logoutBtn: {
    width: "100%", display: "flex", alignItems: "center",
    gap: "10px", padding: "12px 18px",
    background: "transparent", border: "none",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13.5px", fontWeight: "500", color: "#64748b",
    cursor: "pointer", transition: "color 0.2s ease",
    textAlign: "left",
  },
};

export default Navbar;