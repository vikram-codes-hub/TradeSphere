import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const SECTOR_COLORS = {
  Technology:   "#2d7ef7",
  Banking:      "#00e5a0",
  Automobile:   "#ffd166",
  Energy:       "#ff8c42",
  Finance:      "#a78bfa",
  Pharma:       "#f472b6",
  "E-Commerce": "#34d399",
  Conglomerate: "#fb923c",
  Other:        "#64748b",
};

const AllocationChart = ({ holdings }) => {
  // Group by sector
  const sectorMap = {};
  holdings.forEach((h) => {
    const sector = h.sector || "Other";
    sectorMap[sector] = (sectorMap[sector] || 0) + h.currentValue;
  });

  const sectors = Object.keys(sectorMap);
  const values  = sectors.map(s => sectorMap[s]);
  const total   = values.reduce((a, b) => a + b, 0);
  const colors  = sectors.map(s => SECTOR_COLORS[s] || "#64748b");

  const chartData = {
    labels:   sectors,
    datasets: [{
      data:            values,
      backgroundColor: colors.map(c => c + "cc"),
      borderColor:     colors,
      borderWidth:     2,
      hoverOffset:     8,
    }],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    cutout:              "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0e1525",
        borderColor:     "#1a2540",
        borderWidth:     1,
        titleColor:      "#94a3b8",
        bodyColor:       "#e2e8f0",
        padding:         12,
        callbacks: {
          label: (ctx) => {
            const pct = ((ctx.raw / total) * 100).toFixed(1);
            return `  ₹${ctx.raw.toLocaleString("en-IN")} (${pct}%)`;
          },
        },
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
        <span style={{ fontSize: "16px" }}>🥧</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Sector Allocation
        </span>
      </div>

      {holdings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: "13px" }}>
          No holdings to show
        </div>
      ) : (
        <>
          {/* Doughnut chart */}
          <div style={{ height: "180px", position: "relative" }}>
            <Doughnut data={chartData} options={options} />
            {/* Center label */}
            <div style={{
              position:       "absolute",
              top:            "50%",
              left:           "50%",
              transform:      "translate(-50%, -50%)",
              textAlign:      "center",
              pointerEvents:  "none",
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>
                ₹{(total / 1000).toFixed(0)}K
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>invested</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
            {sectors.map((sector, i) => {
              const pct = ((values[i] / total) * 100).toFixed(1);
              return (
                <div key={sector} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: colors[i], flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{sector}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#e2e8f0", fontWeight: "600" }}>
                      {pct}%
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#64748b" }}>
                      ₹{values[i].toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AllocationChart;