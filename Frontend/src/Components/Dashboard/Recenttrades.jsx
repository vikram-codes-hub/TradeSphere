const MOCK_TRADES = [
  { id: 1, type: "BUY",  symbol: "RELIANCE.NS", qty: 5,  price: 2941,  time: "2 mins ago"  },
  { id: 2, type: "SELL", symbol: "WIPRO.NS",    qty: 10, price: 452,   time: "1 hr ago"    },
  { id: 3, type: "BUY",  symbol: "TSLA",        qty: 1,  price: 18420, time: "3 hrs ago"   },
  { id: 4, type: "BUY",  symbol: "TCS.NS",      qty: 2,  price: 3892,  time: "Yesterday"   },
  { id: 5, type: "SELL", symbol: "AAPL",        qty: 1,  price: 18100, time: "2 days ago"  },
];

const RecentTrades = ({ trades = MOCK_TRADES }) => (
  <div style={{
    background:   "#0e1525",
    border:       "1px solid #1a2540",
    borderRadius: "16px",
    padding:      "24px",
  }}>
    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>⚡</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Recent Trades
        </span>
      </div>
      <button style={{ background: "none", border: "none", color: "#2d7ef7", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
        View All →
      </button>
    </div>

    {/* Trades */}
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {trades.map((trade) => {
        const isBuy  = trade.type === "BUY";
        const total  = trade.qty * trade.price;
        const short  = trade.symbol.replace(".NS", "");

        return (
          <div
            key={trade.id}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        "10px 12px",
              borderRadius:   "12px",
              transition:     "background 0.15s ease",
              cursor:         "default",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width:          "34px",
                height:         "34px",
                borderRadius:   "10px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "10px",
                fontWeight:     "700",
                flexShrink:     0,
                background: isBuy ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
                color:      isBuy ? "#00e5a0"               : "#ff4d6d",
                border:     `1px solid ${isBuy ? "rgba(0,229,160,0.25)" : "rgba(255,77,109,0.25)"}`,
              }}>
                {trade.type}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px", fontFamily: "'JetBrains Mono', monospace" }}>
                  {trade.qty} × ₹{trade.price.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize:   "13px",
                fontWeight: "700",
                color:      isBuy ? "#ff4d6d" : "#00e5a0",
              }}>
                {isBuy ? "-" : "+"}₹{total.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{trade.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default RecentTrades;