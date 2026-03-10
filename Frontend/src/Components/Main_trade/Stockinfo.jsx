/* ============================================================
   StockDetails
   ============================================================ */
export const StockDetails = ({ stock }) => {
  const price     = stock.currentPrice  ?? stock.price    ?? 0;
  const prevClose = stock.previousClose ?? stock.prevClose ?? 0;

  const rows = [
    { label: "52W High",   value: stock.weekHigh52 ? `₹${Number(stock.weekHigh52).toLocaleString("en-IN")}` : stock.high52w ? `₹${Number(stock.high52w).toLocaleString("en-IN")}` : "N/A",   color: "#00e5a0" },
    { label: "52W Low",    value: stock.weekLow52  ? `₹${Number(stock.weekLow52).toLocaleString("en-IN")}`  : stock.low52w  ? `₹${Number(stock.low52w).toLocaleString("en-IN")}`  : "N/A",   color: "#ff4d6d" },
    { label: "Market Cap", value: stock.marketCap >= 1e12 ? `₹${(stock.marketCap / 1e12).toFixed(2)}T` : stock.marketCap >= 1e9 ? `₹${(stock.marketCap / 1e9).toFixed(1)}B` : stock.marketCap >= 1e6 ? `₹${(stock.marketCap / 1e6).toFixed(0)}M` : "N/A", color: "#e2e8f0" },
    { label: "Volume",     value: stock.volume >= 1e6 ? `${(stock.volume / 1e6).toFixed(2)}M` : stock.volume >= 1e3 ? `${(stock.volume / 1e3).toFixed(0)}K` : String(stock.volume ?? "N/A"), color: "#2d7ef7" },
    { label: "Prev Close", value: prevClose ? `₹${Number(prevClose).toLocaleString("en-IN")}` : "N/A",     color: "#94a3b8" },
    { label: "Sector",     value: stock.sector   ?? "Unknown",                                              color: "#ffd166" },
    { label: "Exchange",   value: stock.exchange ?? "N/A",                                                  color: "#a78bfa" },
    { label: "P/E Ratio",  value: stock.pe ? stock.pe.toFixed(1) : "N/A",                                   color: "#e2e8f0" },
  ];

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "14px" }}>📋</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Stock Details</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, i) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < rows.length - 1 ? "1px solid #1a2540" : "none" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>{row.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "600", color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   OrderBook — simulated bids/asks around current price
   ============================================================ */
export const OrderBook = ({ stock }) => {
  const price = stock.currentPrice ?? stock.price ?? 0;

  const generateOrders = (base, isBid) =>
    Array.from({ length: 5 }, (_, i) => {
      const offset = (i + 1) * (base * 0.0005);
      const p      = isBid ? base - offset : base + offset;
      const qty    = Math.floor(50 + Math.random() * 500);
      return { price: parseFloat(p.toFixed(2)), qty, total: parseFloat((p * qty).toFixed(0)) };
    });

  const bids   = generateOrders(price, true);
  const asks   = generateOrders(price, false);
  const spread = parseFloat((asks[0].price - bids[0].price).toFixed(2));
  const spreadPct = price > 0 ? ((spread / price) * 100).toFixed(3) : "0.000";
  const maxQty = Math.max(...[...bids, ...asks].map(o => o.qty));

  const Row = ({ order, side }) => {
    const isAsk  = side === "ask";
    const color  = isAsk ? "#ff4d6d" : "#00e5a0";
    const barBg  = isAsk ? "rgba(255,77,109,0.08)" : "rgba(0,229,160,0.08)";
    const barW   = (order.qty / maxQty) * 100;
    return (
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: "8px", padding: "6px 12px" }}>
        <div style={{ position: "absolute", inset: 0, background: barBg, width: `${barW}%`, borderRadius: "3px", opacity: 0.5, pointerEvents: "none" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "600", color, position: "relative" }}>₹{order.price.toLocaleString("en-IN")}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#94a3b8", textAlign: "right", position: "relative" }}>{order.qty}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#64748b", textAlign: "right", position: "relative" }}>₹{(order.total / 1000).toFixed(0)}K</span>
      </div>
    );
  };

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #1a2540" }}>
        <span style={{ fontSize: "14px" }}>📖</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Order Book</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: "8px", padding: "8px 12px", background: "#0a1020" }}>
        {["Price", "Qty", "Total"].map(h => (
          <span key={h} style={{ fontSize: "9px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h !== "Price" ? "right" : "left" }}>{h}</span>
        ))}
      </div>
      <div>{[...asks].reverse().map((o, i) => <Row key={i} order={o} side="ask" />)}</div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#090e1a", borderTop: "1px solid #1a2540", borderBottom: "1px solid #1a2540" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#e2e8f0", fontWeight: "600" }}>₹{price.toLocaleString("en-IN")}</span>
        <span style={{ fontSize: "10px", color: "#64748b" }}>Spread: ₹{spread} ({spreadPct}%)</span>
      </div>
      <div>{bids.map((o, i) => <Row key={i} order={o} side="bid" />)}</div>
    </div>
  );
};

/* ============================================================
   YourPosition
   ============================================================ */
export const YourPosition = ({ position, stock }) => {
  const price = stock?.currentPrice ?? stock?.price ?? 0;

  // Normalise position field names
  const qty      = position?.quantity   ?? position?.shares        ?? 0;
  const avgPrice = position?.avgBuyPrice ?? position?.averageBuyPrice ?? position?.avgPrice ?? 0;

  if (!position || qty === 0) {
    return (
      <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0", marginBottom: "4px" }}>No Position</div>
        <div style={{ fontSize: "11px", color: "#64748b" }}>You don't own any {stock?.symbol?.replace(".NS", "")} shares</div>
      </div>
    );
  }

  const currentValue = qty * price;
  const invested     = qty * avgPrice;
  const pnl          = currentValue - invested;
  const pnlPct       = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : "0.00";
  const isUp         = pnl >= 0;

  return (
    <div style={{ background: "#0e1525", border: `1px solid ${isUp ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`, borderRadius: "16px", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <span style={{ fontSize: "14px" }}>💼</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Position</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {[
          { label: "Shares Owned",  value: `${qty} shares`,                                    color: "#e2e8f0" },
          { label: "Avg Buy Price", value: `₹${Number(avgPrice).toLocaleString("en-IN")}`,     color: "#94a3b8" },
          { label: "Current Value", value: `₹${Number(currentValue).toLocaleString("en-IN")}`, color: "#e2e8f0" },
          { label: "Invested",      value: `₹${Number(invested).toLocaleString("en-IN")}`,     color: "#64748b" },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid #1a2540" : "none" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>{row.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "600", color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", padding: "12px", background: isUp ? "rgba(0,229,160,0.06)" : "rgba(255,77,109,0.06)", border: `1px solid ${isUp ? "rgba(0,229,160,0.15)" : "rgba(255,77,109,0.15)"}`, borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>Unrealised P&L</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "700", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
            {isUp ? "+" : "-"}₹{Math.abs(pnl).toLocaleString("en-IN")}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: isUp ? "#00e5a0" : "#ff4d6d" }}>
            {isUp ? "+" : ""}{pnlPct}%
          </div>
        </div>
      </div>
    </div>
  );
};