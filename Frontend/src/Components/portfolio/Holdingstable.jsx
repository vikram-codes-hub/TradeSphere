import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HoldingsTable = ({ holdings, onSell }) => {
  const navigate   = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [sortCol,  setSortCol] = useState("value");
  const [sortDir,  setSortDir] = useState("desc");

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sorted = [...holdings].sort((a, b) => {
    const aVal = sortCol === "symbol"  ? a.symbol
               : sortCol === "qty"     ? a.quantity
               : sortCol === "avg"     ? a.avgBuyPrice
               : sortCol === "current" ? a.currentPrice
               : sortCol === "pnl"     ? a.pnl
               : a.currentValue;
    const bVal = sortCol === "symbol"  ? b.symbol
               : sortCol === "qty"     ? b.quantity
               : sortCol === "avg"     ? b.avgBuyPrice
               : sortCol === "current" ? b.currentPrice
               : sortCol === "pnl"     ? b.pnl
               : b.currentValue;
    if (sortCol === "symbol") return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const cols = [
    { key: "symbol",  label: "Stock"         },
    { key: "qty",     label: "Qty"           },
    { key: "avg",     label: "Avg Buy Price" },
    { key: "current", label: "Current Price" },
    { key: "value",   label: "Curr Value"    },
    { key: "pnl",     label: "P&L"          },
    { key: null,      label: "Action"        },
  ];

  const thStyle = (key) => ({
    fontSize:      "10px",
    fontWeight:    "700",
    color:         sortCol === key ? "#2d7ef7" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding:       "12px 16px",
    cursor:        key ? "pointer" : "default",
    userSelect:    "none",
    whiteSpace:    "nowrap",
    textAlign:     key === "symbol" ? "left" : "right",
  });

  if (holdings.length === 0) {
    return (
      <div style={{
        background:   "#0e1525",
        border:       "1px solid #1a2540",
        borderRadius: "16px",
        padding:      "60px 24px",
        textAlign:    "center",
        marginBottom: "20px",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>No holdings yet</div>
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>Start trading to build your portfolio</div>
        <button
          onClick={() => navigate("/market")}
          style={{
            background: "#2d7ef7", border: "none", borderRadius: "10px",
            color: "#fff", fontFamily: "'Poppins', sans-serif",
            fontSize: "13px", fontWeight: "600", padding: "10px 24px", cursor: "pointer",
          }}
        >
          Browse Markets →
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      overflow:     "hidden",
      marginBottom: "20px",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>💼</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Holdings — {holdings.length} stocks
          </span>
        </div>
        <button
          onClick={() => navigate("/market")}
          style={{ background: "rgba(45,126,247,0.1)", border: "1px solid rgba(45,126,247,0.25)", borderRadius: "8px", color: "#2d7ef7", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: "600", padding: "6px 14px", cursor: "pointer" }}
        >
          + Buy More
        </button>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #1a2540", background: "#0a1020" }}>
            {cols.map((col, i) => (
              <th
                key={i}
                onClick={() => col.key && handleSort(col.key)}
                style={thStyle(col.key)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {col.label}
                  {col.key && (
                    <span style={{ fontSize: "9px", opacity: sortCol === col.key ? 1 : 0.3 }}>
                      {sortCol === col.key && sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((h) => {
            const isUp   = h.pnl >= 0;
            const short  = h.symbol.replace(".NS", "");
            const isHov  = hovered === h.symbol;

            return (
              <tr
                key={h.symbol}
                onMouseEnter={() => setHovered(h.symbol)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  borderBottom: "1px solid #1a2540",
                  background:   isHov ? "#131d30" : "transparent",
                  transition:   "background 0.15s ease",
                  cursor:       "pointer",
                }}
                onClick={() => navigate(`/trade/${h.symbol}`)}
              >
                {/* Stock */}
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(45,126,247,0.15), rgba(45,126,247,0.05))",
                      border: "1px solid rgba(45,126,247,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: "700", color: "#2d7ef7", flexShrink: 0,
                    }}>
                      {short.slice(0, 3)}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{h.name}</div>
                    </div>
                  </div>
                </td>

                {/* Qty */}
                <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                  {h.quantity}
                </td>

                {/* Avg Buy */}
                <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#94a3b8" }}>
                  ₹{h.avgBuyPrice.toLocaleString("en-IN")}
                </td>

                {/* Current Price */}
                <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                  ₹{h.currentPrice.toLocaleString("en-IN")}
                </td>

                {/* Current Value */}
                <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                  ₹{h.currentValue.toLocaleString("en-IN")}
                </td>

                {/* P&L */}
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
                    {isUp ? "+" : "-"}₹{Math.abs(h.pnl).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: isUp ? "#00e5a0" : "#ff4d6d", marginTop: "2px" }}>
                    {isUp ? "+" : ""}{h.pnlPct}%
                  </div>
                </td>

                {/* Action */}
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSell(h); }}
                    style={{
                      background:   "rgba(255,77,109,0.1)",
                      border:       "1px solid rgba(255,77,109,0.25)",
                      borderRadius: "8px",
                      color:        "#ff4d6d",
                      fontFamily:   "'Poppins', sans-serif",
                      fontSize:     "12px",
                      fontWeight:   "600",
                      padding:      "6px 14px",
                      cursor:       "pointer",
                      transition:   "all 0.15s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,77,109,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,77,109,0.1)"; }}
                  >
                    Sell
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsTable;