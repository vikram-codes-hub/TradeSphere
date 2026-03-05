import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const PERIODS = ["1D", "1W", "1M", "3M", "1Y"];

const generateData = (base, points, volatility = 0.012) => {
  const arr = [base];
  for (let i = 1; i < points; i++) {
    const delta = (Math.random() - 0.48) * arr[i - 1] * volatility;
    arr.push(parseFloat((arr[i - 1] + delta).toFixed(2)));
  }
  return arr;
};

const getConfig = (period, base) => {
  switch (period) {
    case "1D": {
      const hours = Array.from({ length: 24 }, (_, i) => {
        const h = 9 + Math.floor(i / 2);
        const m = i % 2 === 0 ? "00" : "30";
        return `${h}:${m}`;
      }).slice(0, 14);
      return { labels: hours, data: generateData(base, 14, 0.004) };
    }
    case "1W": {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
      return { labels: days, data: generateData(base, 7, 0.01) };
    }
    case "1M": {
      const labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      });
      return { labels, data: generateData(base, 30, 0.012) };
    }
    case "3M": {
      const labels = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (11 - i) * 7);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      });
      return { labels, data: generateData(base, 12, 0.02) };
    }
    case "1Y": {
      const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
      return { labels: months, data: generateData(base, 12, 0.04) };
    }
    default:
      return { labels: [], data: [] };
  }
};

const PriceChart = ({ stock }) => {
  const [period, setPeriod] = useState("1W");

  const { labels, data } = useMemo(
    () => getConfig(period, stock.price),
    [period, stock.price]
  );

  const isUp      = data[data.length - 1] >= data[0];
  const lineColor = isUp ? "#00e5a0" : "#ff4d6d";
  const fillColor = isUp ? "rgba(0,229,160,0.07)" : "rgba(255,77,109,0.07)";

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
        ticks:  {
          color:       "#64748b",
          font:        { size: 10, family: "Poppins" },
          maxRotation: 0,
          callback:    (_, i) => {
            if (period === "1D") return i % 3 === 0 ? labels[i] : "";
            if (period === "1M") return i % 7 === 0 ? labels[i] : "";
            return labels[i];
          },
        },
        border: { display: false },
      },
      y: {
        position: "right",
        grid:     { color: "rgba(255,255,255,0.04)" },
        ticks:    {
          color:    "#64748b",
          font:     { size: 10, family: "Poppins" },
          callback: (v) => `₹${(v / 1000).toFixed(1)}K`,
        },
        border: { display: false },
      },
    },
  };

  const priceDiff    = data[data.length - 1] - data[0];
  const priceDiffPct = ((priceDiff / data[0]) * 100).toFixed(2);

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      padding:      "24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>
            ₹{data[data.length - 1].toLocaleString("en-IN")}
          </span>
          <span style={{
            fontFamily:   "'JetBrains Mono', monospace",
            fontSize:     "12px",
            fontWeight:   "600",
            padding:      "2px 8px",
            borderRadius: "6px",
            background:   isUp ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
            color:        isUp ? "#00e5a0"               : "#ff4d6d",
            border:       `1px solid ${isUp ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`,
          }}>
            {isUp ? "+" : ""}{priceDiffPct}%
          </span>
        </div>

        {/* Period tabs */}
        <div style={{ display: "flex", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px", padding: "3px", gap: "2px" }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background:   p === period ? "#1a2540" : "transparent",
                border:       "none",
                borderRadius: "7px",
                color:        p === period ? "#e2e8f0" : "#64748b",
                fontSize:     "11px",
                fontWeight:   "600",
                padding:      "5px 10px",
                cursor:       "pointer",
                fontFamily:   "'Poppins', sans-serif",
                transition:   "all 0.15s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "220px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceChart;