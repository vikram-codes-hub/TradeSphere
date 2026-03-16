import { useState, useEffect } from "react";

/* ── Market hours check (client-side, IST) ───────────────── */
const getMarketStatus = () => {
  const now   = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist   = new Date(utcMs + 5.5 * 60 * 60 * 1000);

  const day   = ist.getDay();
  const time  = ist.getHours() * 60 + ist.getMinutes();
  const OPEN  = 9  * 60 + 15;
  const CLOSE = 15 * 60 + 30;

  const isOpen = day >= 1 && day <= 5 && time >= OPEN && time < CLOSE;

  let message = "";
  if (!isOpen) {
    if (day === 0 || day === 6) {
      message = "Markets closed on weekends. Opens Monday 9:15 AM IST.";
    } else if (time < OPEN) {
      const mins = OPEN - time;
      message = `Pre-market. Opens in ${Math.floor(mins/60) > 0 ? `${Math.floor(mins/60)}h ` : ""}${mins%60}m (9:15 AM IST)`;
    } else {
      message = "Markets closed for today at 3:30 PM. Opens tomorrow 9:15 AM IST.";
    }
  }

  const hh = String(ist.getHours()).padStart(2,"0");
  const mm = String(ist.getMinutes()).padStart(2,"0");

  return { isOpen, message, istTime: `${hh}:${mm} IST` };
};

const OrderPanel = ({
  stock, cashBalance, maxBuy, sharesOwned,
  position, tradeLoading, tradeResult,
  onBuy, onSell, onClearResult,
}) => {
  const [tab,    setTab]    = useState("BUY");
  const [qty,    setQty]    = useState(1);
  const [error,  setError]  = useState("");
  const [market, setMarket] = useState(() => getMarketStatus());

  // Refresh market status every 30s
  useEffect(() => {
    const iv = setInterval(() => setMarket(getMarketStatus()), 30000);
    return () => clearInterval(iv);
  }, []);

  const isBuy        = tab === "BUY";
  const price        = stock?.currentPrice ?? 0;
  const total        = parseFloat((qty * price).toFixed(2));
  const maxQty       = isBuy ? (maxBuy || 0) : (sharesOwned || 0);
  const canAfford    = isBuy ? total <= cashBalance : qty <= sharesOwned;
  const accentColor  = isBuy ? "#00e5a0"              : "#ff4d6d";
  const accentBg     = isBuy ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)";
  const accentBorder = isBuy ? "rgba(0,229,160,0.25)" : "rgba(255,77,109,0.25)";
  const isDisabled   = tradeLoading || !canAfford || (tab==="SELL" && sharesOwned===0) || !market.isOpen;

  useEffect(() => {
    if (tradeResult?.success) {
      const t = setTimeout(() => { onClearResult(); setQty(1); }, 3000);
      return () => clearTimeout(t);
    }
  }, [tradeResult, onClearResult]);

  const handleQty = (val) => {
    const n = Math.max(1, Math.min(Number(val) || 1, maxQty || 9999));
    setQty(n); setError("");
  };

  const handleOrder = async () => {
    if (!market.isOpen) { setError(market.message); return; }
    if (!canAfford) { setError(isBuy ? "Insufficient balance" : "Not enough shares"); return; }
    setError("");
    const result = isBuy ? await onBuy(qty) : await onSell(qty);
    if (!result?.success) setError(result?.error ?? "Trade failed");
  };

  return (
    <div style={{ background: "#0e1525", border: `1px solid ${tradeResult?.success ? "rgba(0,229,160,0.3)" : "#1a2540"}`, borderRadius: "16px", overflow: "hidden", transition: "border-color 0.3s" }}>

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {["BUY","SELL"].map(t => (
          <button key={t} onClick={() => { setTab(t); setQty(1); setError(""); onClearResult(); }}
            style={{ background: tab===t ? (t==="BUY" ? "rgba(0,229,160,0.12)" : "rgba(255,77,109,0.12)") : "#0a1020", border: "none", borderBottom: `2px solid ${tab===t ? (t==="BUY" ? "#00e5a0" : "#ff4d6d") : "#1a2540"}`, color: tab===t ? (t==="BUY" ? "#00e5a0" : "#ff4d6d") : "#64748b", fontFamily: "'Poppins',sans-serif", fontSize: "14px", fontWeight: "700", padding: "16px", cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.15s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Market closed banner */}
      {!market.isOpen && (
        <div style={{ background: "rgba(255,209,102,0.06)", borderBottom: "1px solid rgba(255,209,102,0.15)", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>🕐</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#ffd166", marginBottom: "2px" }}>Market Closed</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5" }}>{market.message}</div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>Current time: {market.istTime}</div>
          </div>
        </div>
      )}

      <div style={{ padding: "20px" }}>

        {/* Success */}
        {tradeResult?.success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>✅</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>Order Placed!</div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              {tradeResult.type} {tradeResult.qty} × {stock.symbol.replace(".NS","")} @ ₹{Number(tradeResult.price).toLocaleString("en-IN")}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "15px", fontWeight: "700", color: tradeResult.type==="BUY" ? "#ff4d6d" : "#00e5a0", marginTop: "8px" }}>
              {tradeResult.type==="BUY" ? "-" : "+"}₹{Number(tradeResult.total).toLocaleString("en-IN")}
            </div>
          </div>
        ) : (
          <>
            {/* Price */}
            <div style={{ marginBottom: "16px", padding: "12px 14px", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Market Price</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>
                  ₹{price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Quantity</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {[{label:"−", fn:()=>handleQty(qty-1)}, null, {label:"+", fn:()=>handleQty(qty+1)}].map((btn, i) =>
                  btn === null ? (
                    <input key="input" type="number" min={1} max={maxQty} value={qty}
                      onChange={e => handleQty(e.target.value)} disabled={!market.isOpen}
                      style={{ flex: 1, background: "#090e1a", border: "1px solid #1a2540", borderRadius: "9px", color: market.isOpen ? "#e2e8f0" : "#374151", fontFamily: "'JetBrains Mono',monospace", fontSize: "16px", fontWeight: "700", padding: "8px 12px", outline: "none", textAlign: "center" }} />
                  ) : (
                    <button key={btn.label} onClick={btn.fn} disabled={!market.isOpen}
                      style={{ width: "38px", height: "38px", background: "#131d30", border: "1px solid #1a2540", borderRadius: "9px", color: market.isOpen ? "#e2e8f0" : "#374151", fontSize: "18px", cursor: market.isOpen ? "pointer" : "not-allowed", flexShrink: 0 }}>
                      {btn.label}
                    </button>
                  )
                )}
                <button onClick={() => handleQty(maxQty)} disabled={!market.isOpen}
                  style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "9px", color: market.isOpen ? "#64748b" : "#374151", fontFamily: "'Poppins',sans-serif", fontSize: "11px", fontWeight: "600", padding: "8px 10px", cursor: market.isOpen ? "pointer" : "not-allowed", flexShrink: 0 }}>
                  MAX
                </button>
              </div>
              {maxQty > 0 && (
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                  Max: {maxQty} {isBuy ? `shares (₹${(maxQty*price).toLocaleString("en-IN")})` : "shares owned"}
                </div>
              )}
            </div>

            {/* Quick % */}
            {isBuy && (
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                {[25,50,75,100].map(pct => (
                  <button key={pct} onClick={() => handleQty(Math.max(1,Math.floor((maxBuy||0)*pct/100)))}
                    disabled={!market.isOpen}
                    style={{ flex: 1, background: "transparent", border: "1px solid #1a2540", borderRadius: "7px", color: market.isOpen ? "#64748b" : "#374151", fontFamily: "'Poppins',sans-serif", fontSize: "11px", fontWeight: "600", padding: "5px 0", cursor: market.isOpen ? "pointer" : "not-allowed", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (market.isOpen) { e.currentTarget.style.borderColor=accentColor; e.currentTarget.style.color=accentColor; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="#1a2540"; e.currentTarget.style.color=market.isOpen?"#64748b":"#374151"; }}>
                    {pct}%
                  </button>
                ))}
              </div>
            )}

            {/* Summary */}
            <div style={{ background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Price × Qty</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#94a3b8" }}>₹{price.toLocaleString("en-IN")} × {qty}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{isBuy ? "Available Balance" : "Shares Owned"}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#94a3b8" }}>
                  {isBuy ? `₹${cashBalance.toLocaleString("en-IN")}` : `${sharesOwned} shares`}
                </span>
              </div>
              <div style={{ height: "1px", background: "#1a2540", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{isBuy ? "Total Cost" : "You Receive"}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "17px", fontWeight: "700", color: market.isOpen ? accentColor : "#374151" }}>
                  {isBuy ? "-" : "+"}₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              {!isBuy && position && (
                <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Est. P&L on sale</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", fontWeight: "600", color: (price-(position.avgBuyPrice??position.averageBuyPrice??0))>=0?"#00e5a0":"#ff4d6d" }}>
                    {(price-(position.avgBuyPrice??position.averageBuyPrice??0))>=0?"+":""}₹{Math.abs((price-(position.avgBuyPrice??position.averageBuyPrice??0))*qty).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Error */}
            {(error || tradeResult?.error) && (
              <div style={{ fontSize: "12px", color: "#ff4d6d", marginBottom: "12px", padding: "8px 12px", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "8px" }}>
                ⚠️ {error || tradeResult?.error}
              </div>
            )}

            {/* Order button */}
            <button onClick={handleOrder} disabled={isDisabled}
              style={{ width: "100%", background: isDisabled ? "#1a2540" : accentBg, border: `1px solid ${isDisabled ? "#1a2540" : accentBorder}`, borderRadius: "12px", color: isDisabled ? "#374151" : accentColor, fontFamily: "'Poppins',sans-serif", fontSize: "15px", fontWeight: "700", padding: "14px", cursor: isDisabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s", letterSpacing: "0.02em" }}>
              {tradeLoading
                ? <><span style={{ width: "16px", height: "16px", border: `2px solid ${accentColor}40`, borderTop: `2px solid ${accentColor}`, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Placing Order...</>
                : !market.isOpen        ? "🕐 Market Closed"
                : tab==="SELL" && sharesOwned===0 ? "No shares to sell"
                : !canAfford            ? (isBuy ? "Insufficient Balance" : "Not enough shares")
                : `${tab==="BUY" ? "🟢" : "🔴"} Place ${tab} Order · ₹${total.toLocaleString("en-IN")}`
              }
            </button>

            {/* Hours footer */}
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "10px", color: market.isOpen ? "#00e5a0" : "#374151", fontWeight: "600" }}>
              {market.isOpen ? "🟢 Market Open" : "🔴 Market Closed"} · NSE/BSE · Mon–Fri · 9:15 AM–3:30 PM IST
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrderPanel;