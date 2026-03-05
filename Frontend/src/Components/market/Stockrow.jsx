import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniSparkline from "./Minisparkline.jsx";

const StockRow = ({ stock, index, watchlist, onToggleWatchlist }) => {
  const navigate    = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isUp        = stock.change >= 0;
  const isHalted    = stock.isHalted;
  const isWatched   = watchlist.includes(stock.symbol);
  const short       = stock.symbol.replace(".NS", "");

  const exchangeColor = stock.exchange === "NSE" ? "#2d7ef7" : "#a78bfa";

  return (
    <div
      onClick={() => !isHalted && navigate(`/trade/${stock.symbol}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:             "grid",
        gridTemplateColumns: "40px 2fr 1.2fr 1fr 1fr 1fr 100px 44px",
        alignItems:          "center",
        gap:                 "8px",
        padding:             "13px 20px",
        borderBottom:        "1px solid #1a2540",
        cursor:              isHalted ? "not-allowed" : "pointer",
        background:          hovered ? "#131d30" : "transparent",
        transition:          "background 0.15s ease",
        opacity:             isHalted ? 0.6 : 1,
      }}
    >
      {/* Index */}
      <div style={{ fontSize: "12px", color: "#374151", fontWeight: "500", fontFamily: "'JetBrains Mono', monospace" }}>
        {index + 1}
      </div>

      {/* Stock info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width:          "38px",
          height:         "38px",
          borderRadius:   "10px",
          background:     "linear-gradient(135deg, rgba(45,126,247,0.15), rgba(45,126,247,0.05))",
          border:         "1px solid rgba(45,126,247,0.2)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       "11px",
          fontWeight:     "700",
          color:          "#2d7ef7",
          flexShrink:     0,
          fontFamily:     "'Poppins', sans-serif",
        }}>
          {short.slice(0, 3)}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0" }}>{short}</span>
            {isHalted && (
              <span style={{
                fontSize: "9px", fontWeight: "700",
                padding: "2px 6px", borderRadius: "4px",
                background: "rgba(255,77,109,0.15)",
                color: "#ff4d6d",
                border: "1px solid rgba(255,77,109,0.3)",
                letterSpacing: "0.06em",
              }}>
                HALTED
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>{stock.name}</span>
            <span style={{
              fontSize: "9px", fontWeight: "600",
              padding: "1px 6px", borderRadius: "4px",
              background: `${exchangeColor}18`,
              color: exchangeColor,
              letterSpacing: "0.04em",
            }}>
              {stock.exchange}
            </span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{
        fontFamily:  "'JetBrains Mono', monospace",
        fontSize:    "14px",
        fontWeight:  "600",
        color:       "#e2e8f0",
        letterSpacing: "-0.01em",
      }}>
        ₹{stock.price.toLocaleString("en-IN")}
      </div>

      {/* Change */}
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize:   "13px",
          fontWeight: "600",
          color:      isUp ? "#00e5a0" : "#ff4d6d",
        }}>
          {isUp ? "+" : ""}₹{Math.abs(stock.change).toFixed(2)}
        </div>
      </div>

      {/* % Change */}
      <div>
        <span style={{
          display:      "inline-flex",
          alignItems:   "center",
          gap:          "3px",
          fontSize:     "12px",
          fontWeight:   "700",
          padding:      "3px 9px",
          borderRadius: "6px",
          fontFamily:   "'JetBrains Mono', monospace",
          background:   isUp ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
          color:        isUp ? "#00e5a0"               : "#ff4d6d",
          border:       `1px solid ${isUp ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`,
        }}>
          {isUp ? "▲" : "▼"} {Math.abs(stock.changePct).toFixed(2)}%
        </span>
      </div>

      {/* Volume */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize:   "12px",
        color:      "#64748b",
      }}>
        {stock.volume >= 1000000
          ? `${(stock.volume / 1000000).toFixed(1)}M`
          : stock.volume >= 1000
          ? `${(stock.volume / 1000).toFixed(0)}K`
          : stock.volume}
      </div>

      {/* Sparkline */}
      <div>
        <MiniSparkline data={stock.sparkline} isUp={isUp} />
      </div>

      {/* Watchlist button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleWatchlist(stock.symbol); }}
        style={{
          background:   isWatched ? "rgba(255,209,102,0.12)" : "transparent",
          border:       `1px solid ${isWatched ? "rgba(255,209,102,0.3)" : "#1a2540"}`,
          borderRadius: "8px",
          width:        "34px",
          height:       "34px",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          cursor:       "pointer",
          fontSize:     "15px",
          transition:   "all 0.15s ease",
        }}
        onMouseEnter={e => !isWatched && (e.currentTarget.style.borderColor = "rgba(255,209,102,0.4)")}
        onMouseLeave={e => !isWatched && (e.currentTarget.style.borderColor = "#1a2540")}
        title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isWatched ? "⭐" : "☆"}
      </button>
    </div>
  );
};

export default StockRow;