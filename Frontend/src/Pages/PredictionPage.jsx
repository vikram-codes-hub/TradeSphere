import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StockSelector           from "../Components/prediction/Stockselector.jsx"
import PredictionResult        from "../Components/prediction/PredictionResult.jsx";
import ActualVsPredictedChart  from "../Components/prediction/ActualVsPredictedChart.jsx";
import ModelStats              from "../Components/prediction/ModelStats.jsx";
import PredictionHistory       from "../Components/prediction/PredictionHistory.jsx";

/* ── Mock ML result generator — replace with real API call ── */
const generateMockResult = (symbol) => {
  const names = {
    "RELIANCE.NS": "Reliance Industries", "TCS.NS": "Tata Consultancy",
    "INFY.NS": "Infosys", "HDFCBANK.NS": "HDFC Bank", "WIPRO.NS": "Wipro",
    "TATAMOTORS.NS": "Tata Motors", "ICICIBANK.NS": "ICICI Bank",
    "BAJFINANCE.NS": "Bajaj Finance", "ADANIENT.NS": "Adani Enterprises",
    "SUNPHARMA.NS": "Sun Pharmaceutical", "AAPL": "Apple Inc.",
    "TSLA": "Tesla Inc.", "MSFT": "Microsoft Corp.",
    "GOOGL": "Alphabet Inc.", "AMZN": "Amazon.com Inc.",
  };
  const prices = {
    "RELIANCE.NS": 2941, "TCS.NS": 3892, "INFY.NS": 1842, "HDFCBANK.NS": 1623,
    "WIPRO.NS": 452, "TATAMOTORS.NS": 987, "ICICIBANK.NS": 1124,
    "BAJFINANCE.NS": 6870, "ADANIENT.NS": 2340, "SUNPHARMA.NS": 1678,
    "AAPL": 18100, "TSLA": 18420, "MSFT": 39800, "GOOGL": 15420, "AMZN": 17800,
  };

  const currentPrice  = prices[symbol] || 1000;
  const pctChange     = parseFloat(((Math.random() - 0.35) * 8).toFixed(2));
  const predictedPrice= parseFloat((currentPrice * (1 + pctChange / 100)).toFixed(2));
  const trend         = pctChange > 1 ? "bullish" : pctChange < -1 ? "bearish" : "neutral";
  const confidence    = Math.floor(55 + Math.random() * 35);

  return {
    symbol,
    companyName:    names[symbol] || symbol,
    currentPrice,
    predictedPrice,
    pctChange,
    trend,
    confidence,
    modelUsed:      "Random Forest",
    r2:             parseFloat((0.72 + Math.random() * 0.2).toFixed(3)),
    rmse:           Math.floor(80 + Math.random() * 300),
    predictedAt:    new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  };
};

/* ============================================================
   PREDICTIONS PAGE
   ============================================================ */
const PredictionsPage = () => {
  const navigate  = useNavigate();

  // Replace with useAuth()
  const isPremium = true;

  const [selected,  setSelected]  = useState("TSLA");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loadingDots, setLoadingDots] = useState("");

  // Animate loading dots
  const animateDots = () => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setLoadingDots(".".repeat((count % 3) + 1));
      if (count >= 9) clearInterval(interval);
    }, 400);
  };

  const handleRun = () => {
    if (!selected || loading) return;
    setLoading(true);
    setResult(null);
    animateDots();

    // Simulate ML processing time — replace with real API call
    setTimeout(() => {
      const newResult = generateMockResult(selected);
      setResult(newResult);
      setHistory(prev => [
        {
          id:             Date.now(),
          symbol:         newResult.symbol,
          name:           newResult.companyName,
          trend:          newResult.trend,
          confidence:     newResult.confidence,
          currentPrice:   newResult.currentPrice,
          predictedPrice: newResult.predictedPrice,
          pctChange:      newResult.pctChange,
          time:           "Just now",
        },
        ...prev.slice(0, 9),
      ]);
      setLoading(false);
      setLoadingDots("");
    }, 2800);
  };

  const handleRerun = (symbol) => {
    setSelected(symbol);
    setTimeout(handleRun, 100);
  };

  // ── Premium lock screen ───────────────────────────────────
  if (!isPremium) {
    return (
      <div style={{
        minHeight:       "100vh",
        background:      "#090e1a",
        fontFamily:      "'Poppins', sans-serif",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "24px",
      }}>
        <div style={{
          background:   "#0e1525",
          border:       "1px solid rgba(167,139,250,0.25)",
          borderRadius: "24px",
          padding:      "48px 40px",
          maxWidth:     "460px",
          width:        "100%",
          textAlign:    "center",
          boxShadow:    "0 0 60px rgba(167,139,250,0.08)",
        }}>
          <div style={{ fontSize: "56px", marginBottom: "20px" }}>🤖</div>
          <div style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          "6px",
            fontSize:     "10px",
            fontWeight:   "700",
            padding:      "4px 12px",
            borderRadius: "100px",
            background:   "rgba(167,139,250,0.12)",
            color:        "#a78bfa",
            border:       "1px solid rgba(167,139,250,0.25)",
            marginBottom: "16px",
            letterSpacing:"0.08em",
          }}>
            ⭐ PREMIUM FEATURE
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#e2e8f0", marginBottom: "12px" }}>
            AI Price Predictions
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.7", marginBottom: "28px" }}>
            Upgrade to Premium to unlock next-day price predictions powered by our Random Forest ML model trained on real stock data.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", textAlign: "left" }}>
            {["📈 Next-day price prediction", "🎯 Bullish / Bearish trend signal", "💯 Confidence score (40–95%)", "📊 Actual vs Predicted chart", "🧠 R² and RMSE model stats", "🕒 Full prediction history"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#94a3b8" }}>
                <span style={{ color: "#a78bfa" }}>✓</span> {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/upgrade")}
            style={{
              width:        "100%",
              background:   "linear-gradient(135deg, #a78bfa, #2d7ef7)",
              border:       "none",
              borderRadius: "12px",
              color:        "#fff",
              fontFamily:   "'Poppins', sans-serif",
              fontSize:     "15px",
              fontWeight:   "700",
              padding:      "14px",
              cursor:       "pointer",
              boxShadow:    "0 8px 24px rgba(167,139,250,0.3)",
            }}
          >
            ⭐ Upgrade to Premium — It's Free →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Page header ──────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>
                AI Predictions
              </h1>
              <span style={{
                fontSize: "10px", fontWeight: "700",
                padding: "3px 10px", borderRadius: "100px",
                background: "rgba(167,139,250,0.12)",
                color: "#a78bfa",
                border: "1px solid rgba(167,139,250,0.25)",
                letterSpacing: "0.08em",
              }}>
                PREMIUM
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Random Forest ML model — next-day price prediction
            </p>
          </div>
        </div>

        {/* ── Stock selector ───────────────────────────────── */}
        <StockSelector
          selected={selected}
          onSelect={setSelected}
          onRun={handleRun}
          loading={loading}
        />

        {/* ── Loading state ────────────────────────────────── */}
        {loading && (
          <div style={{
            background:   "#0e1525",
            border:       "1px solid rgba(167,139,250,0.2)",
            borderRadius: "16px",
            padding:      "48px 24px",
            textAlign:    "center",
            marginBottom: "20px",
            boxShadow:    "0 0 40px rgba(167,139,250,0.05)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", animation: "float 2s ease-in-out infinite" }}>🤖</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>
              Running ML Model{loadingDots}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
              Fetching data · Engineering features · Training model · Predicting
            </div>
            {/* Progress bar */}
            <div style={{ maxWidth: "300px", margin: "0 auto", height: "4px", background: "#1a2540", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "2px",
                background: "linear-gradient(90deg, #a78bfa, #2d7ef7)",
                animation: "progressBar 2.8s ease forwards",
              }} />
            </div>
          </div>
        )}

        {/* ── Result ───────────────────────────────────────── */}
        {result && !loading && (
          <>
            <PredictionResult result={result} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", marginBottom: "20px" }}>
              <ActualVsPredictedChart />
              <ModelStats result={result} />
            </div>
          </>
        )}

        {/* ── Empty state (no prediction yet) ─────────────── */}
        {!result && !loading && (
          <div style={{
            background:   "#0e1525",
            border:       "1px dashed #1a2540",
            borderRadius: "16px",
            padding:      "60px 24px",
            textAlign:    "center",
            marginBottom: "20px",
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎯</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>
              Ready to predict
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Select a stock above and click <strong style={{ color: "#a78bfa" }}>Run Prediction</strong>
            </div>
          </div>
        )}

        {/* ── History ──────────────────────────────────────── */}
        <PredictionHistory history={history} onRerun={handleRerun} />

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-8px); }
        }
        @keyframes progressBar {
          0%   { width: 0%;    }
          30%  { width: 40%;   }
          70%  { width: 75%;   }
          100% { width: 100%;  }
        }
      `}</style>
    </div>
  );
};

export default PredictionsPage;