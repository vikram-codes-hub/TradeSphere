const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div style={{
      minHeight:      "100vh",
      background:     "#090e1a",
      fontFamily:     "'Poppins', sans-serif",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      backgroundImage:"radial-gradient(ellipse 80% 40% at 50% -10%, rgba(45,126,247,0.06) 0%, transparent 70%)",
    }}>
      <div style={{ textAlign: "center" }}>

        {/* Spinner rings */}
        <div style={{ position: "relative", width: "64px", height: "64px", margin: "0 auto 24px" }}>
          {/* Outer ring */}
          <div style={{
            position:     "absolute",
            inset:        0,
            borderRadius: "50%",
            border:       "2px solid transparent",
            borderTop:    "2px solid #2d7ef7",
            borderRight:  "2px solid #2d7ef7",
            animation:    "spinOuter 1s linear infinite",
          }} />
          {/* Inner ring */}
          <div style={{
            position:     "absolute",
            inset:        "10px",
            borderRadius: "50%",
            border:       "2px solid transparent",
            borderTop:    "2px solid #a78bfa",
            animation:    "spinInner 0.7s linear infinite reverse",
          }} />
          {/* Center dot */}
          <div style={{
            position:     "absolute",
            inset:        "24px",
            borderRadius: "50%",
            background:   "#2d7ef7",
            opacity:      0.6,
            animation:    "pulse 1.5s ease-in-out infinite",
          }} />
        </div>

        {/* TradeSphere logo text */}
        <div style={{
          fontSize:      "18px",
          fontWeight:    "800",
          color:         "#e2e8f0",
          letterSpacing: "-0.02em",
          marginBottom:  "6px",
        }}>
          TradeSphere
        </div>

        {/* Message */}
        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
          {message}
        </div>

        {/* Loading dots */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "20px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width:        "6px",
                height:       "6px",
                borderRadius: "50%",
                background:   "#2d7ef7",
                animation:    `dotBounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

      </div>

      <style>{`
        @keyframes spinOuter {
          to { transform: rotate(360deg); }
        }
        @keyframes spinInner {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1);    }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-8px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;