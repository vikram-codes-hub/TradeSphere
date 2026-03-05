import { useState } from "react";

const OrderPanel = ({ stock, position, cashBalance, onOrderPlace }) => {
  const [tab,      setTab]      = useState("BUY");
  const [qty,      setQty]      = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const isBuy     = tab === "BUY";
  const total     = parseFloat((qty * stock.price).toFixed(2));
  const maxBuy    = Math.floor(cashBalance / stock.price);
  const maxSell   = position?.quantity || 0;
  const maxQty    = isBuy ? maxBuy : maxSell;

  const accentColor = isBuy ? "#00e5a0" : "#ff4d6d";
  const accentBg    = isBuy ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)";
  const accentBorder= isBuy ? "rgba(0,229,160,0.25)" : "rgba(255,77,109,0.25)";

  const canAfford = isBuy ? total <= cashBalance : qty <= maxSell;

  const handleQty = (val) => {
    const n = Math.max(1, Math.min(val, maxQty || 999));
    setQty(n);
    setError("");
  };

  const handleOrder = () => {
    if (!canAfford) {
      setError(isBuy ? "Insufficient balance" : "Not enough shares");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onOrderPlace && onOrderPlace({ type: tab, symbol: stock.symbol, qty, price: stock.price, total });
      setTimeout(() => { setSuccess(false); setQty(1); }, 2500);
    }, 1500);
  };

  return (
    <div style={{
      background:   "#0e1525",
      border:       `1px solid ${success ? "rgba(0,229,160,0.3)" : "#1a2540"}`,
      borderRadius: "16px",
      overflow:     "hidden",
      transition:   "border-color 0.3s",
    }}>
      {/* BUY / SELL tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {["BUY", "SELL"].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setQty(1); setError(""); setSuccess(false); }}
            style={{
              background:  tab === t
                ? (t === "BUY" ? "rgba(0,229,160,0.12)" : "rgba(255,77,109,0.12)")
                : "#0a1020",
              border:      "none",
              borderBottom:`2px solid ${tab === t ? (t === "BUY" ? "#00e5a0" : "#ff4d6d") : "#1a2540"}`,
              color:       tab === t ? (t === "BUY" ? "#00e5a0" : "#ff4d6d") : "#64748b",
              fontFamily:  "'Poppins', sans-serif",
              fontSize:    "14px",
              fontWeight:  "700",
              padding:     "16px",
              cursor:      "pointer",
              letterSpacing:"0.04em",
              transition:  "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px" }}>
        {success ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>✅</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>
              Order Placed!
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              {tab} {qty} × {stock.symbol.replace(".NS", "")} @ ₹{stock.price.toLocaleString("en-IN")}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "700", color: isBuy ? "#ff4d6d" : "#00e5a0", marginTop: "8px" }}>
              {isBuy ? "-" : "+"}₹{total.toLocaleString("en-IN")}
            </div>
          </div>
        ) : (
          <>
            {/* Current price display */}
            <div style={{ marginBottom: "16px", padding: "12px 14px", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Market Price</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>
                  ₹{stock.price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Quantity input */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                Quantity
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={() => handleQty(qty - 1)}
                  style={{ width: "38px", height: "38px", background: "#131d30", border: "1px solid #1a2540", borderRadius: "9px", color: "#e2e8f0", fontSize: "18px", cursor: "pointer", flexShrink: 0 }}
                >−</button>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={qty}
                  onChange={e => handleQty(parseInt(e.target.value) || 1)}
                  style={{
                    flex:        1,
                    background:  "#090e1a",
                    border:      "1px solid #1a2540",
                    borderRadius:"9px",
                    color:       "#e2e8f0",
                    fontFamily:  "'JetBrains Mono', monospace",
                    fontSize:    "16px",
                    fontWeight:  "700",
                    padding:     "8px 12px",
                    outline:     "none",
                    textAlign:   "center",
                  }}
                />
                <button
                  onClick={() => handleQty(qty + 1)}
                  style={{ width: "38px", height: "38px", background: "#131d30", border: "1px solid #1a2540", borderRadius: "9px", color: "#e2e8f0", fontSize: "18px", cursor: "pointer", flexShrink: 0 }}
                >+</button>
                <button
                  onClick={() => handleQty(maxQty)}
                  style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "9px", color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: "600", padding: "8px 10px", cursor: "pointer", flexShrink: 0 }}
                >
                  MAX
                </button>
              </div>
              {maxQty > 0 && (
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                  Max: {maxQty} {isBuy ? `shares (₹${(maxQty * stock.price).toLocaleString("en-IN")})` : "shares owned"}
                </div>
              )}
            </div>

            {/* Quick percentages (buy only) */}
            {isBuy && (
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleQty(Math.max(1, Math.floor(maxBuy * pct / 100)))}
                    style={{
                      flex:         1,
                      background:   "transparent",
                      border:       "1px solid #1a2540",
                      borderRadius: "7px",
                      color:        "#64748b",
                      fontFamily:   "'Poppins', sans-serif",
                      fontSize:     "11px",
                      fontWeight:   "600",
                      padding:      "5px 0",
                      cursor:       "pointer",
                      transition:   "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#64748b"; }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}

            {/* Order summary */}
            <div style={{ background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Price × Qty</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>
                  ₹{stock.price.toLocaleString("en-IN")} × {qty}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {isBuy ? "Available Balance" : "Shares Owned"}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>
                  {isBuy ? `₹${cashBalance.toLocaleString("en-IN")}` : `${maxSell} shares`}
                </span>
              </div>
              <div style={{ height: "1px", background: "#1a2540", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                  {isBuy ? "Total Cost" : "You Receive"}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "17px", fontWeight: "700", color: accentColor }}>
                  {isBuy ? "-" : "+"}₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              {!isBuy && position && (
                <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Est. P&L on sale</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "600", color: (stock.price - position.avgBuyPrice) >= 0 ? "#00e5a0" : "#ff4d6d" }}>
                    {(stock.price - position.avgBuyPrice) >= 0 ? "+" : ""}₹{Math.abs((stock.price - position.avgBuyPrice) * qty).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: "12px", color: "#ff4d6d", marginBottom: "12px", padding: "8px 12px", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "8px" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleOrder}
              disabled={loading || !canAfford || (tab === "SELL" && maxSell === 0)}
              style={{
                width:        "100%",
                background:   loading || !canAfford ? "#1a2540" : accentBg,
                border:       `1px solid ${loading || !canAfford ? "#1a2540" : accentBorder}`,
                borderRadius: "12px",
                color:        loading || !canAfford ? "#374151" : accentColor,
                fontFamily:   "'Poppins', sans-serif",
                fontSize:     "15px",
                fontWeight:   "700",
                padding:      "14px",
                cursor:       loading || !canAfford ? "not-allowed" : "pointer",
                display:      "flex",
                alignItems:   "center",
                justifyContent:"center",
                gap:          "8px",
                transition:   "all 0.2s",
                letterSpacing:"0.02em",
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: `2px solid ${accentColor}40`, borderTop: `2px solid ${accentColor}`, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Placing Order...
                </>
              ) : tab === "SELL" && maxSell === 0 ? (
                "No shares to sell"
              ) : !canAfford ? (
                isBuy ? "Insufficient Balance" : "Not enough shares"
              ) : (
                `${tab === "BUY" ? "🟢" : "🔴"} Place ${tab} Order · ₹${total.toLocaleString("en-IN")}`
              )}
            </button>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderPanel;