import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const ActualVsPredictedChart = ({ priceHistory = [] }) => {
  // Generate mock 30-day actual vs predicted — replace with real ML data
  const generateData = () => {
    const labels    = [];
    const actual    = [];
    const predicted = [];
    let base        = 18000;

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }));

      const noise  = (Math.random() - 0.49) * base * 0.012;
      base        += noise;
      actual.push(parseFloat(base.toFixed(2)));

      // Predicted slightly offset from actual
      const predNoise = (Math.random() - 0.5) * base * 0.008;
      predicted.push(parseFloat((base + predNoise).toFixed(2)));
    }
    return { labels, actual, predicted };
  };

  const { labels, actual, predicted } = priceHistory.length > 0
    ? priceHistory
    : generateData();

  const chartData = {
    labels,
    datasets: [
      {
        label:           "Actual Price",
        data:            actual,
        borderColor:     "#2d7ef7",
        borderWidth:     2,
        backgroundColor: "rgba(45,126,247,0.05)",
        fill:            true,
        tension:         0.4,
        pointRadius:     0,
        pointHoverRadius:5,
        pointHoverBackgroundColor: "#2d7ef7",
      },
      {
        label:           "Predicted Price",
        data:            predicted,
        borderColor:     "#a78bfa",
        borderWidth:     2,
        borderDash:      [5, 4],
        backgroundColor: "transparent",
        fill:            false,
        tension:         0.4,
        pointRadius:     0,
        pointHoverRadius:5,
        pointHoverBackgroundColor: "#a78bfa",
      },
    ],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: "index", intersect: false },
    plugins: {
      legend: {
        display:  true,
        position: "top",
        align:    "end",
        labels: {
          color:     "#94a3b8",
          font:      { size: 11, family: "Poppins" },
          boxWidth:  16,
          boxHeight: 2,
          padding:   16,
          usePointStyle: true,
          pointStyle:    "line",
        },
      },
      tooltip: {
        backgroundColor: "#0e1525",
        borderColor:     "#1a2540",
        borderWidth:     1,
        titleColor:      "#64748b",
        bodyColor:       "#e2e8f0",
        padding:         12,
        callbacks: {
          label: (ctx) => `  ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid:   { display: false },
        ticks:  {
          color:       "#64748b",
          font:        { size: 10, family: "Poppins" },
          maxRotation: 0,
          callback:    (_, i) => (i % 5 === 0 ? labels[i] : ""),
        },
        border: { display: false },
      },
      y: {
        grid:   { color: "rgba(255,255,255,0.04)" },
        ticks:  {
          color:    "#64748b",
          font:     { size: 10, family: "Poppins" },
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      padding:      "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <span style={{ fontSize: "16px" }}>📊</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Actual vs Predicted — 30 Days
        </span>
      </div>
      <div style={{ height: "220px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ActualVsPredictedChart;