import React, { useState } from "react";
import SparklineChart from "./Sparklinechart"
import { trendColors } from "../../assets/Mockdata";

const WatchlistCard = ({ stock, onRemove, onSetAlert, onTrade }) => {
  const [hovered, setHovered] = useState(false);
  const [showAlertInput, setShowAlertInput] = useState(false);
  const [alertVal, setAlertVal] = useState(stock.alert || "");

  const isUp = stock.changePct >= 0;
  const isNeutral = Math.abs(stock.changePct) < 0.1;
  const priceColor = isNeutral ? "#f0b429" : isUp ? "#22c55e" : "#ef4444";
  const trend = trendColors[stock.trend] || trendColors.neutral;

  const handleAlertSave = () => {
    onSetAlert(stock.symbol, parseFloat(alertVal));
    setShowAlertInput(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#0f2236" : "#080f18",
        border: `1px solid ${hovered ? "#2a3f55" : "#111e2d"}`,
        borderLeft: `3px solid ${hovered ? priceColor : "transparent"}`,
        borderRadius: "12px",
        padding: "18px 20px",
        transition: "all 0.18s",
        cursor: "default",
        position: "relative",
      }}
    >
      <div className="flex items-center gap-4">

        {/* Symbol + Name */}
        <div style={{ minWidth: "150px" }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{
              fontFamily: "monospace", fontWeight: "800",
              fontSize: "15px", color: "#e8eaed", letterSpacing: "0.5px",
            }}>
              {stock.symbol}
            </span>
            <span style={{
              background: trend.bg, color: trend.text,
              border: `1px solid ${trend.border}`,
              fontSize: "9px", fontFamily: "monospace", fontWeight: "700",
              letterSpacing: "1px", padding: "1px 7px", borderRadius: "999px",
            }}>
              {stock.trend.toUpperCase()}
            </span>
            {stock.alert && (
              <span style={{
                background: "#f0b42915", color: "#f0b429",
                border: "1px solid #f0b42930",
                fontSize: "9px", fontFamily: "monospace",
                padding: "1px 6px", borderRadius: "999px",
              }} title={`Alert at ₹${stock.alert}`}>
                🔔
              </span>
            )}
          </div>
          <div style={{ color: "#4a6580", fontSize: "11px", fontFamily: "monospace" }}>
            {stock.name}
          </div>
        </div>

        {/* Sparkline */}
        <div style={{ flex: "0 0 90px" }}>
          <SparklineChart data={stock.sparkline} color={priceColor} width={90} height={34} />
        </div>

        {/* Price */}
        <div style={{ minWidth: "120px", textAlign: "right" }}>
          <div style={{ color: "#e8eaed", fontFamily: "monospace", fontSize: "18px", fontWeight: "800" }}>
            ₹{stock.currentPrice.toLocaleString("en-IN")}
          </div>
          <div style={{
            color: priceColor, fontFamily: "monospace",
            fontSize: "12px", fontWeight: "600",
          }}>
            {isUp ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)} ({isUp ? "+" : ""}{stock.changePct.toFixed(2)}%)
          </div>
        </div>

        {/* H/L */}
        <div style={{ minWidth: "110px" }}>
          <div style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "2px" }}>H / L</div>
          <div style={{ fontFamily: "monospace", fontSize: "12px" }}>
            <span style={{ color: "#22c55e" }}>₹{stock.high.toLocaleString("en-IN")}</span>
            <span style={{ color: "#374151" }}> / </span>
            <span style={{ color: "#ef4444" }}>₹{stock.low.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Volume */}
        <div style={{ minWidth: "80px" }}>
          <div style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "2px" }}>VOLUME</div>
          <div style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: "13px", fontWeight: "600" }}>{stock.volume}</div>
        </div>

        {/* Market Cap */}
        <div style={{ minWidth: "90px" }}>
          <div style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "2px" }}>MCAP</div>
          <div style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: "13px", fontWeight: "600" }}>{stock.marketCap}</div>
        </div>

        {/* Actions — visible on hover */}
        <div style={{
          marginLeft: "auto",
          display: "flex", gap: "8px", alignItems: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
        }}>
          <button
            onClick={() => onTrade(stock.symbol)}
            style={{
              background: "#22c55e20", border: "1px solid #22c55e40",
              borderRadius: "6px", padding: "6px 14px",
              color: "#22c55e", fontFamily: "monospace",
              fontSize: "11px", fontWeight: "700",
              letterSpacing: "1px", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#22c55e30"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#22c55e20"; }}
          >
            TRADE
          </button>

          <button
            onClick={() => setShowAlertInput(!showAlertInput)}
            style={{
              background: "#f0b42915", border: "1px solid #f0b42930",
              borderRadius: "6px", padding: "6px 10px",
              color: "#f0b429", fontFamily: "monospace",
              fontSize: "11px", cursor: "pointer",
              transition: "all 0.15s",
            }}
            title="Set price alert"
          >
            🔔
          </button>

          <button
            onClick={() => onRemove(stock.symbol)}
            style={{
              background: "#ef444415", border: "1px solid #ef444430",
              borderRadius: "6px", padding: "6px 10px",
              color: "#ef4444", fontFamily: "monospace",
              fontSize: "11px", cursor: "pointer",
              transition: "all 0.15s",
            }}
            title="Remove from watchlist"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Alert input row */}
      {showAlertInput && (
        <div style={{
          marginTop: "12px", paddingTop: "12px",
          borderTop: "1px solid #1e2d3d",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <span style={{ color: "#4a6580", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px" }}>
            SET ALERT AT ₹
          </span>
          <input
            type="number"
            value={alertVal}
            onChange={e => setAlertVal(e.target.value)}
            placeholder={stock.currentPrice}
            onKeyDown={e => e.key === "Enter" && handleAlertSave()}
            style={{
              background: "#0a1929", border: "1px solid #f0b42940",
              borderRadius: "6px", padding: "5px 10px",
              color: "#e8eaed", fontFamily: "monospace", fontSize: "13px",
              width: "130px", outline: "none",
            }}
          />
          <button onClick={handleAlertSave} style={{
            background: "#f0b429", color: "#000", border: "none",
            borderRadius: "6px", padding: "5px 14px",
            fontFamily: "monospace", fontSize: "11px",
            fontWeight: "700", cursor: "pointer",
          }}>
            SAVE
          </button>
          <button onClick={() => setShowAlertInput(false)} style={{
            background: "transparent", color: "#4a6580",
            border: "1px solid #1e2d3d", borderRadius: "6px",
            padding: "5px 10px", fontFamily: "monospace",
            fontSize: "11px", cursor: "pointer",
          }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchlistCard;