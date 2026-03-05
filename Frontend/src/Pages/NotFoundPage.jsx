import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      backgroundImage: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(45,126,247,0.08) 0%, transparent 70%)",
    }}>
      <div style={{ textAlign: "center", maxWidth: "480px", padding: "24px" }}>

        {/* 404 glitch text */}
        <div style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      "120px",
          fontWeight:    "800",
          lineHeight:    "1",
          marginBottom:  "8px",
          background:    "linear-gradient(135deg, #2d7ef7, #a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          letterSpacing: "-0.04em",
        }}>
          404
        </div>

        {/* Icon */}
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔭</div>

        {/* Title */}
        <h1 style={{
          fontSize:      "24px",
          fontWeight:    "800",
          color:         "#e2e8f0",
          margin:        "0 0 12px",
          letterSpacing: "-0.02em",
        }}>
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize:     "14px",
          color:        "#64748b",
          lineHeight:   "1.7",
          marginBottom: "32px",
        }}>
          Looks like this page got delisted. It may have moved, been removed,
          or never existed in the first place.
        </p>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background:   "transparent",
              border:       "1px solid #1a2540",
              borderRadius: "12px",
              color:        "#94a3b8",
              fontFamily:   "'Poppins', sans-serif",
              fontSize:     "14px",
              fontWeight:   "600",
              padding:      "12px 24px",
              cursor:       "pointer",
              transition:   "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#243050"; e.currentTarget.style.color = "#e2e8f0"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            ← Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background:   "linear-gradient(135deg, #2d7ef7, #1a6fd4)",
              border:       "none",
              borderRadius: "12px",
              color:        "#fff",
              fontFamily:   "'Poppins', sans-serif",
              fontSize:     "14px",
              fontWeight:   "700",
              padding:      "12px 24px",
              cursor:       "pointer",
              boxShadow:    "0 4px 16px rgba(45,126,247,0.3)",
              transition:   "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            🏠 Go to Dashboard
          </button>

          <button
            onClick={() => navigate("/market")}
            style={{
              background:   "rgba(0,229,160,0.1)",
              border:       "1px solid rgba(0,229,160,0.25)",
              borderRadius: "12px",
              color:        "#00e5a0",
              fontFamily:   "'Poppins', sans-serif",
              fontSize:     "14px",
              fontWeight:   "600",
              padding:      "12px 24px",
              cursor:       "pointer",
              transition:   "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,229,160,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,229,160,0.1)"}
          >
            📈 Browse Markets
          </button>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #1a2540" }}>
          <div style={{ fontSize: "11px", color: "#374151", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
            Quick Links
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Portfolio", path: "/portfolio", icon: "💼" },
              { label: "Predictions", path: "/predictions", icon: "🤖" },
              { label: "Leaderboard", path: "/leaderboard", icon: "🏆" },
              { label: "Profile", path: "/profile", icon: "👤" },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background:   "#0e1525",
                  border:       "1px solid #1a2540",
                  borderRadius: "8px",
                  color:        "#64748b",
                  fontFamily:   "'Poppins', sans-serif",
                  fontSize:     "12px",
                  fontWeight:   "500",
                  padding:      "6px 14px",
                  cursor:       "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "5px",
                  transition:   "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#243050"; e.currentTarget.style.color = "#e2e8f0"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#64748b"; }}
              >
                {link.icon} {link.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;