import { useState, useEffect, useCallback } from "react";
import { predictionService } from "../services/predictionService";
import { useSocket }         from "../hooks/useSocket";
import { useAuth }           from "../Context/AuthContext";
import StockSelector          from "../Components/prediction/Stockselector.jsx";
import PredictionResult       from "../Components/prediction/PredictionResult.jsx";
import ActualVsPredictedChart from "../Components/prediction/ActualVsPredictedChart.jsx";
import ModelStats             from "../Components/prediction/ModelStats.jsx";
import PredictionHistory      from "../Components/prediction/PredictionHistory.jsx";

/* ============================================================
   PREDICTIONS PAGE
   ============================================================ */
const PredictionsPage = () => {
  const socket    = useSocket();
  const { user }  = useAuth();
  const isPremium = user?.isPremium ?? user?.plan === "premium" ?? false;

  const [selected,     setSelected]     = useState("RELIANCE.NS");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [history,      setHistory]      = useState([]);
  const [historyLoad,  setHistoryLoad]  = useState(true);
  const [usage,        setUsage]        = useState(null);
  const [error,        setError]        = useState(null);
  const [loadingDots,  setLoadingDots]  = useState("");

  // ── Fetch history + usage on mount ───────────────────
  useEffect(() => {
    const load = async () => {
      setHistoryLoad(true);
      try {
        const [histRes, usageRes] = await Promise.all([
          predictionService.getHistory({ limit: 10 }),
          predictionService.getUsage().catch(() => null),
        ]);
        setHistory(histRes?.predictions ?? histRes?.history ?? []);
        setUsage(usageRes);
      } catch (_) {}
      setHistoryLoad(false);
    };
    load();
  }, []);

  // ── Socket: prediction:ready ──────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onReady = (data) => {
      // data shape: { prediction: { ... } } or prediction object directly
      const p = data?.prediction ?? data;
      if (!p) return;

      // Normalise to component-expected shape
      setResult({
        symbol:         p.symbol,
        companyName:    p.companyName ?? p.symbol,
        currentPrice:   p.currentPrice  ?? p.lastPrice   ?? 0,
        predictedPrice: p.predictedPrice ?? p.prediction  ?? 0,
        pctChange:      p.pctChange      ?? p.changePercent ?? parseFloat((((p.predictedPrice - p.currentPrice) / p.currentPrice) * 100).toFixed(2)),
        trend:          p.trend          ?? (p.pctChange > 1 ? "bullish" : p.pctChange < -1 ? "bearish" : "neutral"),
        confidence:     p.confidence     ?? p.confidenceScore ?? 0,
        modelUsed:      p.modelUsed      ?? p.model        ?? "Random Forest",
        r2:             p.r2             ?? p.r2Score       ?? 0,
        rmse:           p.rmse           ?? 0,
        priceHistory:   p.priceHistory   ?? [],
        predictedAt:    p.createdAt
          ? new Date(p.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      });
      setLoading(false);
      setLoadingDots("");
      setError(null);

      // Prepend to history
      setHistory(prev => [p, ...prev].slice(0, 10));
    };

    const onError = (data) => {
      setError(data?.message ?? "Prediction failed");
      setLoading(false);
      setLoadingDots("");
    };

    socket.on("prediction:ready",  onReady);
    socket.on("prediction:failed", onError);
    return () => {
      socket.off("prediction:ready",  onReady);
      socket.off("prediction:failed", onError);
    };
  }, [socket]);

  // ── Animate loading dots ──────────────────────────────
  const animateDots = useCallback(() => {
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setLoadingDots(".".repeat((count % 3) + 1));
    }, 400);
    // Clear after 60s max (safety valve)
    setTimeout(() => clearInterval(iv), 60000);
    return iv;
  }, []);

  // ── Run prediction ────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!selected || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const iv = animateDots();

    try {
      await predictionService.requestPrediction(selected);
      // Result comes via socket — don't setLoading(false) here
    } catch (err) {
      clearInterval(iv);
      setError(err?.response?.data?.message ?? "Failed to start prediction");
      setLoading(false);
      setLoadingDots("");
    }
  }, [selected, loading, animateDots]);

  // ── Rerun from history ────────────────────────────────
  const handleRerun = useCallback((symbol) => {
    setSelected(symbol);
    setResult(null);
    // Slight delay to let state update
    setTimeout(async () => {
      setLoading(true);
      setError(null);
      animateDots();
      try {
        await predictionService.requestPrediction(symbol);
      } catch (err) {
        setError(err?.response?.data?.message ?? "Failed to start prediction");
        setLoading(false);
        setLoadingDots("");
      }
    }, 100);
  }, [animateDots]);

  // ── Premium lock screen ───────────────────────────────
  if (!isPremium) {
    return (
      <div style={{ minHeight: "100vh", background: "#090e1a", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ background: "#0e1525", border: "1px solid rgba(167,139,250,0.25)", borderRadius: "24px", padding: "48px 40px", maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 0 60px rgba(167,139,250,0.08)" }}>
          <div style={{ fontSize: "56px", marginBottom: "20px" }}>🤖</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10px", fontWeight: "700", padding: "4px 12px", borderRadius: "100px", background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)", marginBottom: "16px", letterSpacing: "0.08em" }}>
            ⭐ PREMIUM FEATURE
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#e2e8f0", marginBottom: "12px" }}>AI Price Predictions</h2>
          <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.7", marginBottom: "28px" }}>
            Upgrade to Premium to unlock next-day price predictions powered by our Random Forest ML model.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", textAlign: "left" }}>
            {["📈 Next-day price prediction", "🎯 Bullish / Bearish trend signal", "💯 Confidence score", "📊 Actual vs Predicted chart", "🧠 R² and RMSE model stats", "🕒 Full prediction history"].map(f => (
              <div key={f} style={{ fontSize: "13px", color: "#94a3b8" }}><span style={{ color: "#a78bfa" }}>✓</span> {f}</div>
            ))}
          </div>
          <button style={{ width: "100%", background: "linear-gradient(135deg, #a78bfa, #2d7ef7)", border: "none", borderRadius: "12px", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: "700", padding: "14px", cursor: "pointer" }}>
            ⭐ Upgrade to Premium →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#090e1a", fontFamily: "'Poppins', sans-serif", backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>AI Predictions</h1>
              <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "100px", background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)", letterSpacing: "0.08em" }}>PREMIUM</span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Random Forest ML model — next-day price prediction</p>
          </div>
          {/* Usage badge */}
          {usage && (
            <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "12px", padding: "10px 16px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>Predictions Today</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "18px", fontWeight: "700", color: "#e2e8f0", marginTop: "2px" }}>
                {usage.used ?? 0} <span style={{ fontSize: "12px", color: "#64748b" }}>/ {usage.limit ?? "∞"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stock selector */}
        <StockSelector selected={selected} onSelect={setSelected} onRun={handleRun} loading={loading} />

        {/* Loading state */}
        {loading && (
          <div style={{ background: "#0e1525", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "16px", padding: "48px 24px", textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", animation: "float 2s ease-in-out infinite" }}>🤖</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>Running ML Model{loadingDots}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>Fetching data · Engineering features · Training model · Predicting</div>
            <div style={{ maxWidth: "300px", margin: "0 auto", height: "4px", background: "#1a2540", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "2px", background: "linear-gradient(90deg, #a78bfa, #2d7ef7)", animation: "progressBar 3s ease forwards" }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <span style={{ fontSize: "13px", color: "#ff4d6d", fontWeight: "600" }}>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <>
            <PredictionResult result={result} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", marginBottom: "20px" }}>
              <ActualVsPredictedChart priceHistory={result.priceHistory} />
              <ModelStats result={result} />
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{ background: "#0e1525", border: "1px dashed #1a2540", borderRadius: "16px", padding: "60px 24px", textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎯</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>Ready to predict</div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>Select a stock above and click <strong style={{ color: "#a78bfa" }}>Run Prediction</strong></div>
          </div>
        )}

        {/* History */}
        <PredictionHistory history={history} loading={historyLoad} onRerun={handleRerun} />

      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes progressBar { 0%{width:0%} 30%{width:40%} 70%{width:75%} 100%{width:100%} }
      `}</style>
    </div>
  );
};

export default PredictionsPage;