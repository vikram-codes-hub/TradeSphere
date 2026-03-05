import React from "react";

const WatchlistSummaryBar = ({ stocks }) => {
  const gainers = stocks.filter(s => s.changePct > 0).length;
  const losers = stocks.filter(s => s.changePct < 0).length;
  const topGainer = [...stocks].sort((a, b) => b.changePct - a.changePct)[0];
  const topLoser = [...stocks].sort((a, b) => a.changePct - b.changePct)[0];
  const totalValue = stocks.reduce((sum, s) => sum + s.currentPrice, 0);

  return (
    <div style={{
      padding: "14px 32px",
      borderBottom: "1px solid #1e2d3d",
      display: "flex",
      alignItems: "center",
      gap: "0",
      overflowX: "auto",
    }}>
      {[
        {
          label: "GAINERS",
          value: gainers,
          color: "#22c55e",
          suffix: ` of ${stocks.length}`,
        },
        {
          label: "LOSERS",
          value: losers,
          color: "#ef4444",
          suffix: ` of ${stocks.length}`,
        },
        {
          label: "TOP GAINER",
          value: topGainer ? `${topGainer.symbol}` : "—",
          color: "#22c55e",
          suffix: topGainer ? ` +${topGainer.changePct.toFixed(2)}%` : "",
          suffixColor: "#22c55e",
        },
        {
          label: "TOP LOSER",
          value: topLoser ? `${topLoser.symbol}` : "—",
          color: "#ef4444",
          suffix: topLoser ? ` ${topLoser.changePct.toFixed(2)}%` : "",
          suffixColor: "#ef4444",
        },
        {
          label: "TRACKED VALUE",
          value: `₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
          color: "#e8eaed",
          suffix: "",
        },
      ].map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && (
            <div style={{ width: "1px", height: "30px", background: "#1e2d3d", margin: "0 20px", flexShrink: 0 }} />
          )}
          <div style={{ flexShrink: 0 }}>
            <div style={{ color: "#4a6580", fontSize: "9px", fontFamily: "monospace", letterSpacing: "2px", marginBottom: "2px" }}>
              {item.label}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "700" }}>
              <span style={{ color: item.color }}>{item.value}</span>
              {item.suffix && (
                <span style={{ color: item.suffixColor || "#4a6580", fontSize: "11px", fontWeight: "400" }}>
                  {item.suffix}
                </span>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Gainer/Loser ratio bar */}
      <div style={{ marginLeft: "auto", minWidth: "180px", flexShrink: 0 }}>
        <div style={{ color: "#4a6580", fontSize: "9px", fontFamily: "monospace", letterSpacing: "2px", marginBottom: "4px" }}>
          MARKET SENTIMENT
        </div>
        <div style={{ height: "6px", borderRadius: "999px", overflow: "hidden", background: "#ef444430", display: "flex" }}>
          <div style={{
            width: `${(gainers / stocks.length) * 100}%`,
            background: "#22c55e",
            borderRadius: "999px",
            transition: "width 0.5s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
          <span style={{ color: "#22c55e", fontSize: "9px", fontFamily: "monospace" }}>▲ BULL</span>
          <span style={{ color: "#ef4444", fontSize: "9px", fontFamily: "monospace" }}>BEAR ▼</span>
        </div>
      </div>
    </div>
  );
};

export default WatchlistSummaryBar;