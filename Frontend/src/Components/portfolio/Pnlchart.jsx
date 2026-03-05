import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// Generate 30-day mock P&L history — replace with real API
const generate30DayPnL = () => {
  const data   = [];
  const labels = [];
  let val      = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }));
    val += (Math.random() - 0.45) * 800;
    data.push(parseFloat(val.toFixed(2)));
  }
  return { data, labels };
};

const { data: PNL_DATA, labels: PNL_LABELS } = generate30DayPnL();

const PnLChart = ({ data = PNL_DATA, labels = PNL_LABELS }) => {
  const latest = data[data.length - 1];
  const isUp   = latest >= 0;
  const lineColor = isUp ? "#00e5a0" : "#ff4d6d";
  const fillColor = isUp ? "rgba(0,229,160,0.07)" : "rgba(255,77,109,0.07)";

  // Show only every 5th label to avoid crowding
  const sparseLabels = labels.map((l, i) => (i % 5 === 0 || i === labels.length - 1) ? l : "");

  const chartData = {
    labels: sparseLabels,
    datasets: [{
      data,
      borderColor:            lineColor,
      borderWidth:            2,
      backgroundColor:        fillColor,
      fill:                   true,
      tension:                0.4,
      pointRadius:            0,
      pointHoverRadius:       5,
      pointHoverBackgroundColor: lineColor,
      pointHoverBorderColor:  "#090e1a",
      pointHoverBorderWidth:  2,
    }],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0e1525",
        borderColor:     "#1a2540",
        borderWidth:     1,
        titleColor:      "#64748b",
        bodyColor:       lineColor,
        padding:         12,
        callbacks: {
          title: (items) => labels[items[0].dataIndex],
          label: (ctx) => `  P&L: ${ctx.raw >= 0 ? "+" : ""}₹${ctx.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid:   { display: false },
        ticks:  { color: "#64748b", font: { size: 10, family: "Poppins" }, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        grid:   { color: "rgba(255,255,255,0.04)" },
        ticks:  {
          color: "#64748b",
          font:  { size: 10, family: "Poppins" },
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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📈</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            P&L — Last 30 Days
          </span>
        </div>
        <span style={{
          fontFamily:   "'JetBrains Mono', monospace",
          fontSize:     "14px",
          fontWeight:   "700",
          padding:      "4px 12px",
          borderRadius: "8px",
          background:   isUp ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
          color:        isUp ? "#00e5a0"               : "#ff4d6d",
          border:       `1px solid ${isUp ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`,
        }}>
          {isUp ? "+" : ""}₹{latest.toLocaleString("en-IN")}
        </span>
      </div>

      <div style={{ height: "180px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PnLChart;