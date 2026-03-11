import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const PERIODS = ["1D", "1W", "1M", "3M", "1Y"];

const MS_MAP = {
  "1D": 86_400_000,
  "1W": 7  * 86_400_000,
  "1M": 30 * 86_400_000,
  "3M": 90 * 86_400_000,
  "1Y": 365* 86_400_000,
};

/* Returns true when every price in the array is the same */
const isFlat = (arr) => {
  if (arr.length < 2) return true;
  // Need at least 10 distinct price values to draw a meaningful chart
  const distinct = new Set(arr.map(v => v.toFixed(2))).size;
  return distinct < 10;
};

const generateMock = (base, points, volatility = 0.012) => {
  const arr = [base];
  for (let i = 1; i < points; i++) {
    const delta = (Math.random() - 0.48) * arr[i - 1] * volatility;
    arr.push(parseFloat((arr[i - 1] + delta).toFixed(2)));
  }
  return arr;
};

const MOCK_LABELS = {
  "1D": Array.from({ length: 14 }, (_, i) => { const h = 9 + Math.floor(i / 2); return `${h}:${i % 2 === 0 ? "00" : "30"}`; }),
  "1W": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
  "1M": Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }),
  "3M": Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (11 - i) * 7); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }),
  "1Y": ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"],
};

const PriceChart = ({ stock }) => {
  const [period, setPeriod] = useState("1W");

  const basePrice    = stock.currentPrice ?? stock.price ?? 100;
  const priceHistory = stock.priceHistory ?? [];

  const { labels, data, isLive } = useMemo(() => {
    // Slice real history to the selected period
    const cutoff = Date.now() - MS_MAP[period];
    const sliced = priceHistory.filter(p => new Date(p.timestamp).getTime() >= cutoff);
    const prices = sliced.map(p => p.price);

    // Use real data only when it has meaningful variation
    if (prices.length >= 2 && !isFlat(prices)) {
      const labels = sliced.map(p => {
        const d = new Date(p.timestamp);
        if (period === "1D") return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        if (period === "1Y") return d.toLocaleDateString("en-IN", { month: "short" });
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      });
      return { labels, data: prices, isLive: true };
    }

    // Fallback: realistic mock based on current price
    const mockLabels = MOCK_LABELS[period];
    const VOLS = { "1D": 0.004, "1W": 0.01, "1M": 0.015, "3M": 0.025, "1Y": 0.04 };
    const mockData = generateMock(basePrice, mockLabels.length, VOLS[period] ?? 0.01);
    // Pin last value to actual current price so chart ends at real price
    mockData[mockData.length - 1] = basePrice;
    return { labels: mockLabels, data: mockData, isLive: false };
  }, [period, priceHistory, basePrice]);

  const isUp      = data.length >= 2 ? data[data.length - 1] >= data[0] : true;
  const lineColor = isUp ? "#00e5a0" : "#ff4d6d";
  const fillColor = isUp ? "rgba(0,229,160,0.07)" : "rgba(255,77,109,0.07)";

  const priceDiff    = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const priceDiffPct = data[0] > 0 ? ((priceDiff / data[0]) * 100).toFixed(2) : "0.00";

  const chartData = {
    labels,
    datasets: [{
      data,
      borderColor:               lineColor,
      borderWidth:               2,
      backgroundColor:           fillColor,
      fill:                      true,
      tension:                   0.4,
      pointRadius:               0,
      pointHoverRadius:          5,
      pointHoverBackgroundColor: lineColor,
      pointHoverBorderColor:     "#090e1a",
      pointHoverBorderWidth:     2,
    }],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: "index", intersect: false },
    plugins: {
      legend:  { display: false },
      tooltip: {
        backgroundColor: "#0e1525",
        borderColor:     "#1a2540",
        borderWidth:     1,
        titleColor:      "#64748b",
        bodyColor:       lineColor,
        padding:         12,
        callbacks: { label: (ctx) => `  ₹${Number(ctx.raw).toLocaleString("en-IN")}` },
      },
    },
    scales: {
      x: {
        grid:   { display: false },
        ticks:  { color: "#64748b", font: { size: 10, family: "Poppins" }, maxRotation: 0, maxTicksLimit: 8 },
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

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>
            ₹{basePrice.toLocaleString("en-IN")}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "600",
            padding: "2px 8px", borderRadius: "6px",
            background: isUp ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
            color:      isUp ? "#00e5a0"               : "#ff4d6d",
            border:     `1px solid ${isUp ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`,
          }}>
            {isUp ? "+" : ""}{priceDiffPct}%
          </span>
          {!isLive && (
            <span style={{ fontSize: "10px", color: "#374151", fontStyle: "italic" }}>simulated</span>
          )}
        </div>

        {/* Period tabs */}
        <div style={{ display: "flex", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px", padding: "3px", gap: "2px" }}>
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{
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
            }}>
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