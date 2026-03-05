import { useState }  from "react";
import { Line }      from "react-chartjs-2";
import {Chart as ChartJS,CategoryScale, LinearScale,PointElement, LineElement,Tooltip, Filler,} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const PERIODS = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
    data:   [98200, 99500, 97800, 101200, 103400, 108900, 112430],
  },
  "1M": {
    labels: ["W1", "W2", "W3", "W4", "Today"],
    data:   [95000, 98000, 102000, 107000, 112430],
  },
  "3M": {
    labels: ["Jan", "Feb", "Mar"],
    data:   [90000, 102000, 112430],
  },
  "1Y": {
    labels: ["Apr", "Jun", "Aug", "Oct", "Dec", "Mar"],
    data:   [80000, 85000, 92000, 95000, 105000, 112430],
  },
};

const PortfolioChart = () => {
  const [period, setPeriod] = useState("7D");
  const { labels, data }   = PERIODS[period];

  const isUp      = data[data.length - 1] >= data[0];
  const lineColor = isUp ? "#00e5a0" : "#ff4d6d";
  const fillColor = isUp ? "rgba(0,229,160,0.07)" : "rgba(255,77,109,0.07)";

  const totalChange    = data[data.length - 1] - data[0];
  const totalChangePct = ((totalChange / data[0]) * 100).toFixed(2);

  const chartData = {
    labels,
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
          label: (ctx) => `  ₹${ctx.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid:   { display: false },
        ticks:  { color: "#64748b", font: { size: 11, family: "Poppins" } },
        border: { display: false },
      },
      y: {
        grid:   { color: "rgba(255,255,255,0.04)" },
        ticks:  {
          color: "#64748b",
          font:  { size: 11, family: "Poppins" },
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            Portfolio Value
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "24px", fontWeight: "700", color: "#e2e8f0" }}>
              ₹{data[data.length - 1].toLocaleString("en-IN")}
            </span>
            <span style={{
              fontSize: "12px", fontWeight: "600",
              padding: "3px 10px", borderRadius: "100px",
              background: isUp ? "rgba(0,229,160,0.12)" : "rgba(255,77,109,0.12)",
              color:      isUp ? "#00e5a0"              : "#ff4d6d",
              border:     `1px solid ${isUp ? "rgba(0,229,160,0.25)" : "rgba(255,77,109,0.25)"}`,
            }}>
              {isUp ? "+" : ""}{totalChangePct}% this period
            </span>
          </div>
        </div>

        {/* Period buttons */}
        <div style={{
          display:      "flex",
          gap:          "4px",
          background:   "#090e1a",
          border:       "1px solid #1a2540",
          borderRadius: "10px",
          padding:      "4px",
        }}>
          {Object.keys(PERIODS).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background:   p === period ? "#2d7ef7" : "transparent",
                border:       "none",
                borderRadius: "7px",
                color:        p === period ? "#fff" : "#64748b",
                fontSize:     "12px",
                fontWeight:   "600",
                padding:      "5px 12px",
                cursor:       "pointer",
                fontFamily:   "'Poppins', sans-serif",
                transition:   "all 0.15s ease",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "200px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PortfolioChart;