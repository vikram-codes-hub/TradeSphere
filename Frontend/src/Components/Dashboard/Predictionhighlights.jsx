import { useNavigate } from "react-router-dom";

const MOCK_PREDICTIONS = [
  { symbol: "TSLA",   name: "Tesla",            predictedPrice: 19200, currentPrice: 18420, confidence: 82, trend: "bullish" },
  { symbol: "TCS.NS", name: "Tata Consultancy", predictedPrice: 4050,  currentPrice: 3892,  confidence: 74, trend: "bullish" },
  { symbol: "AAPL",   name: "Apple Inc.",        predictedPrice: 18800, currentPrice: 18100, confidence: 68, trend: "bullish" },
];

const PredictionHighlights = ({ predictions = MOCK_PREDICTIONS, isPremium = true }) => {
  const navigate = useNavigate();

  if (!isPremium) {
    return (
      <div style={{
        background:   "#0e1525",
        border:       "1px solid rgba(167,139,250,0.2)",
        borderRadius: "16px",
        padding:      "24px",
        position:     "relative",
        overflow:     "hidden",
        minHeight:    "200px",
      }}>
        {/* Blurred background */}
        <div style={{ opacity: 0.2, pointerEvents: "none" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
            🤖 AI Prediction Highlights
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "52px", background: "#131d30", borderRadius: "12px", marginBottom: "8px" }} />
          ))}
        </div>

        {/* Lock overlay */}
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "12px",
          backdropFilter: "blur(4px)",
          background:     "rgba(9,14,26,0.6)",
          borderRadius:   "16px",
        }}>
          <div style={{ fontSize: "40px" }}>🔒</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>Premium Feature</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>Upgrade to unlock AI price predictions</div>
            <button
              onClick={() => navigate("/upgrade")}
              style={{
                background:   "linear-gradient(135deg, #a78bfa, #2d7ef7)",
                border:       "none",
                borderRadius: "10px",
                color:        "#fff",
                fontSize:     "13px",
                fontWeight:   "700",
                padding:      "10px 20px",
                cursor:       "pointer",
                fontFamily:   "'Poppins', sans-serif",
              }}
            >
              ⭐ Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid rgba(167,139,250,0.2)",
      borderRadius: "16px",
      padding:      "24px",
      boxShadow:    "0 0 32px rgba(167,139,250,0.06)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>🤖</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            AI Predictions
          </span>
          <span style={{
            fontSize: "10px", fontWeight: "700",
            padding: "2px 8px", borderRadius: "100px",
            background: "rgba(167,139,250,0.12)",
            color: "#a78bfa",
            border: "1px solid rgba(167,139,250,0.25)",
            letterSpacing: "0.06em",
          }}>
            PREMIUM
          </span>
        </div>
        <button
          onClick={() => navigate("/predictions")}
          style={{ background: "none", border: "none", color: "#a78bfa", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
        >
          View All →
        </button>
      </div>

      {/* Prediction rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {predictions.map((p) => {
          const pct   = (((p.predictedPrice - p.currentPrice) / p.currentPrice) * 100).toFixed(2);
          const short = p.symbol.replace(".NS", "");

          return (
            <div
              key={p.symbol}
              onClick={() => navigate(`/predictions?symbol=${p.symbol}`)}
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                padding:        "10px 12px",
                borderRadius:   "12px",
                cursor:         "pointer",
                transition:     "background 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px",
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: "700", color: "#a78bfa", flexShrink: 0,
                }}>
                  {short.slice(0, 3)}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: "700",
                      padding: "1px 7px", borderRadius: "4px",
                      background: "rgba(0,229,160,0.1)", color: "#00e5a0",
                    }}>
                      📈 Bullish
                    </span>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>
                      {p.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                  ₹{p.predictedPrice.toLocaleString("en-IN")}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "700", color: "#00e5a0", marginTop: "2px" }}>
                  +{pct}% predicted
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionHighlights;