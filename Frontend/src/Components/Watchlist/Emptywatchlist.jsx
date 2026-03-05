import React from "react";

const EmptyWatchlist = ({ onAdd }) => (
  <div style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 32px",
    textAlign: "center",
  }}>
    <div style={{
      width: "72px", height: "72px",
      borderRadius: "50%",
      background: "#0a1929",
      border: "1px solid #1e2d3d",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "28px", marginBottom: "20px",
    }}>
      📋
    </div>
    <h3 style={{
      fontFamily: '"Georgia", serif',
      fontSize: "22px", color: "#e8eaed",
      marginBottom: "8px",
    }}>
      Your watchlist is empty
    </h3>
    <p style={{
      color: "#4a6580", fontFamily: "monospace",
      fontSize: "12px", maxWidth: "280px",
      lineHeight: "1.6", marginBottom: "24px",
    }}>
      Track stocks you're interested in. Add symbols to monitor live prices, trends, and set alerts.
    </p>
    <button
      onClick={onAdd}
      style={{
        background: "#f0b429", color: "#000",
        border: "none", borderRadius: "8px",
        padding: "10px 24px",
        fontFamily: "monospace", fontSize: "12px",
        fontWeight: "700", letterSpacing: "1.5px",
        cursor: "pointer",
      }}
    >
      + ADD YOUR FIRST STOCK
    </button>
  </div>
);

export default EmptyWatchlist;