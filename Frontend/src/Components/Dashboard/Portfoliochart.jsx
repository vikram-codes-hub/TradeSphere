import { useState }      from "react";
import { Line }          from "react-chartjs-2";
import { useNavigate }   from "react-router-dom";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from "chart.js";
import { useDashboard } from "../../Context/Dashboardcontext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const PERIODS = ["7D", "1M", "3M", "1Y"];

const PortfolioChart = () => {
  const [period, setPeriod]  = useState("7D");
  const navigate             = useNavigate();
  const { summary, loading } = useDashboard();
  // console.log("In the dahsbaor component the summary is,",summary)

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
        <div style={{ height: "14px", width: "120px", background: "#1a2540", borderRadius: "4px", marginBottom: "16px", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: "32px", width: "180px", background: "#1a2540", borderRadius: "4px", marginBottom: "20px", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: "200px", background: "#1a2540", borderRadius: "8px", animation: "shimmer 1.5s infinite" }} />
        <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  // ── Empty — no trades yet ─────────────────────────────
  if (!summary || summary.totalTrades === 0) {
    return (
      <div style={{
        background: "#0e1525", border: "1px solid #1a2540",
        borderRadius: "16px", padding: "24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "280px", gap: "12px", textAlign: "center",
      }}>
        <div style={{ fontSize: "48px" }}>📊</div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0" }}>
          No portfolio history yet
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", maxWidth: "320px", lineHeight: "1.6" }}>
          Make your first trade to start tracking your portfolio performance over time.
        </div>
        <button
          onClick={() => navigate("/market")}
          style={{
            marginTop: "8px",
            background: "linear-gradient(135deg, #2d7ef7, #1a5fd4)",
            border: "none", borderRadius: "10px",
            color: "#fff", fontSize: "13px", fontWeight: "700",
            padding: "10px 20px", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Browse Markets →
        </button>
      </div>
    );
  }

  // ── Real chart (Start → Now) ──────────────────────────
  const netWorth  = summary.netWorth        ?? 100000;
  const invested  = summary.totalDeposited  ?? 100000;
  const isUp      = netWorth >= invested;
  const lineColor = isUp ? "#00e5a0" : "#ff4d6d";
  const fillColor = isUp ? "rgba(0,229,160,0.07)" : "rgba(255,77,109,0.07)";
  const changePct = (((netWorth - invested) / invested) * 100).toFixed(2);

  const chartData = {
    labels:   ["Deposited", "Current"],
    datasets: [{
      data:                      [invested, netWorth],
      borderColor:               lineColor,
      borderWidth:               2,
      backgroundColor:           fillColor,
      fill:                      true,
      tension:                   0.4,
      pointRadius:               4,
      pointBackgroundColor:      lineColor,
      pointHoverRadius:          6,
      pointHoverBackgroundColor: lineColor,
      pointHoverBorderColor:     "#090e1a",
      pointHoverBorderWidth:     2,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0e1525", borderColor: "#1a2540", borderWidth: 1,
        titleColor: "#64748b", bodyColor: lineColor, padding: 12,
        callbacks: { label: (ctx) => `  ₹${ctx.raw.toLocaleString("en-IN")}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 11, family: "Poppins" } }, border: { display: false } },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#64748b", font: { size: 11, family: "Poppins" }, callback: (v) => `₹${(v / 1000).toFixed(0)}K` },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            Portfolio Value
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "24px", fontWeight: "700", color: "#e2e8f0" }}>
              ₹{netWorth.toLocaleString("en-IN")}
            </span>
            <span style={{
              fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "100px",
              background: isUp ? "rgba(0,229,160,0.12)" : "rgba(255,77,109,0.12)",
              color:      isUp ? "#00e5a0"              : "#ff4d6d",
              border:     `1px solid ${isUp ? "rgba(0,229,160,0.25)" : "rgba(255,77,109,0.25)"}`,
            }}>
              {isUp ? "+" : ""}{changePct}% overall
            </span>
          </div>
        </div>

        {/* Period toggles — cosmetic until history API exists */}
        <div style={{ display: "flex", gap: "4px", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px", padding: "4px" }}>
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              background: p === period ? "#2d7ef7" : "transparent",
              border: "none", borderRadius: "7px",
              color: p === period ? "#fff" : "#64748b",
              fontSize: "12px", fontWeight: "600",
              padding: "5px 12px", cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", transition: "all 0.15s ease",
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "200px" }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Note */}
      <div style={{ marginTop: "12px", fontSize: "11px", color: "#334155", textAlign: "center" }}>
        📌 Full history tracking unlocks after more trades
      </div>
    </div>
  );
};

export default PortfolioChart;