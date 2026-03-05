import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: ["Dashboard", "Market", "Portfolio", "Leaderboard", "Watchlist"],
    Trading: ["Place Order", "Order Book", "Trade History", "ML Predictions", "Circuit Breaker"],
    Account: ["Login", "Register", "My Profile", "Settings", "Upgrade to Premium"],
    Company: ["About Us", "Blog", "Careers", "Press Kit", "Contact"],
  };

  const socials = [
    { label: "Twitter", icon: "𝕏" },
    { label: "GitHub", icon: "⌥" },
    { label: "Discord", icon: "◈" },
    { label: "LinkedIn", icon: "in" },
  ];

  return (
    <footer style={{
      background: "#040b12",
      borderTop: "1px solid #1e2d3d",
      padding: "56px 0 0",
      fontFamily: "monospace",
    }}>
      {/* Top section */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "40px", marginBottom: "48px" }}>

          {/* Brand block */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: "#f0b429", fontSize: "11px", letterSpacing: "4px", marginBottom: "6px" }}>
                TRADESPHERE
              </div>
              <div style={{ color: "#e8eaed", fontFamily: '"Georgia", serif', fontSize: "22px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
                Trade Smarter.
              </div>
              <div style={{ color: "#4a6580", fontFamily: '"Georgia", serif', fontSize: "22px", fontStyle: "italic" }}>
                Not Harder.
              </div>
            </div>
            <p style={{ color: "#4a6580", fontSize: "12px", lineHeight: "1.8", maxWidth: "240px", marginBottom: "20px" }}>
              A real-time stock exchange simulator with live order matching, ML predictions, and virtual trading — built for serious learners.
            </p>

            {/* Status pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#22c55e10", border: "1px solid #22c55e30",
              borderRadius: "999px", padding: "6px 14px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
              <span style={{ color: "#22c55e", fontSize: "10px", fontWeight: "700", letterSpacing: "1.5px" }}>ALL SYSTEMS LIVE</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <div style={{ color: "#f0b429", fontSize: "10px", letterSpacing: "2px", fontWeight: "700", marginBottom: "16px" }}>
                {category.toUpperCase()}
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map(item => (
                  <li key={item}>
                    <a href="#" style={{
                      color: "#4a6580", fontSize: "12px", textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => e.target.style.color = "#e8eaed"}
                    onMouseLeave={e => e.target.style.color = "#4a6580"}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div style={{
          background: "#0a1929",
          border: "1px solid #1e2d3d",
          borderRadius: "12px",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          marginBottom: "40px",
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{ color: "#e8eaed", fontSize: "14px", fontFamily: '"Georgia", serif', fontWeight: "bold", marginBottom: "3px" }}>
              Market Insights, Weekly
            </div>
            <div style={{ color: "#4a6580", fontSize: "11px" }}>
              Get top movers, strategy tips & platform updates.
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                background: "#060d14", border: "1px solid #1e2d3d",
                borderRadius: "8px", padding: "9px 16px",
                color: "#e8eaed", fontFamily: "monospace", fontSize: "12px",
                outline: "none", width: "220px",
              }}
              onFocus={e => e.target.style.borderColor = "#f0b42960"}
              onBlur={e => e.target.style.borderColor = "#1e2d3d"}
            />
            <button style={{
              background: "#f0b429", color: "#000",
              border: "none", borderRadius: "8px",
              padding: "9px 20px", fontFamily: "monospace",
              fontSize: "11px", fontWeight: "800",
              letterSpacing: "1.5px", cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #1e2d3d", padding: "16px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>

          <div style={{ color: "#2a3f55", fontSize: "11px" }}>
            © {currentYear} TradeSphere. Virtual money only. Not financial advice.
          </div>

          {/* Social icons */}
          <div style={{ display: "flex", gap: "8px" }}>
            {socials.map(s => (
              <button key={s.label} title={s.label} style={{
                width: "32px", height: "32px",
                background: "transparent",
                border: "1px solid #1e2d3d",
                borderRadius: "8px",
                color: "#4a6580", fontSize: "12px",
                fontFamily: "monospace", fontWeight: "700",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0b42960"; e.currentTarget.style.color = "#f0b429"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2d3d"; e.currentTarget.style.color = "#4a6580"; }}
              >
                {s.icon}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy Policy", "Terms of Use", "Cookie Settings"].map(item => (
              <a key={item} href="#" style={{
                color: "#2a3f55", fontSize: "11px", textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.target.style.color = "#4a6580"}
              onMouseLeave={e => e.target.style.color = "#2a3f55"}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;