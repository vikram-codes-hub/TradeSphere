import { useState } from "react";

const TYPE_CONFIG = {
  BUY:        { label: "BUY",  bg: "rgba(0,229,160,0.1)",   color: "#00e5a0", border: "rgba(0,229,160,0.25)"   },
  SELL:       { label: "SELL", bg: "rgba(255,77,109,0.1)",  color: "#ff4d6d", border: "rgba(255,77,109,0.25)"  },
  DEPOSIT:    { label: "DEP",  bg: "rgba(45,126,247,0.1)",  color: "#2d7ef7", border: "rgba(45,126,247,0.25)"  },
  WITHDRAWAL: { label: "WDR",  bg: "rgba(255,209,102,0.1)", color: "#ffd166", border: "rgba(255,209,102,0.25)" },
};

const TransactionHistory = ({ transactions = [] }) => {
  const [filter, setFilter] = useState("ALL");
  const [page,   setPage]   = useState(1);
  const PER_PAGE = 6;

  const filtered = filter === "ALL" ? transactions : transactions.filter(t => t.type === filter);
  const total    = Math.ceil(filtered.length / PER_PAGE);
  const paged    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a2540", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📋</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Transaction History</span>
        </div>
        <div style={{ display: "flex", background: "#090e1a", border: "1px solid #1a2540", borderRadius: "10px", padding: "3px", gap: "2px" }}>
          {["ALL", "BUY", "SELL"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              style={{ background: filter === f ? "#1a2540" : "transparent", border: "none", borderRadius: "7px", color: filter === f ? "#e2e8f0" : "#64748b", fontSize: "11px", fontWeight: "600", padding: "5px 12px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 80px 120px 120px 1fr", gap: "8px", padding: "10px 24px", background: "#0a1020", borderBottom: "1px solid #1a2540" }}>
        {["Type", "Stock", "Qty", "Price", "Total", "Time"].map(h => (
          <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
        ))}
      </div>

      {paged.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>No transactions found</div>
      ) : paged.map((tx, i) => {
        const cfg   = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.BUY;
        const isBuy = tx.type === "BUY";
        const short = tx.symbol ? tx.symbol.replace(".NS", "") : "—";
        const qty   = tx.quantity ?? tx.qty;
        const price = tx.price ?? tx.executedPrice ?? tx.priceAtTrade;
        const ttl   = tx.total ?? tx.totalAmount ?? (qty && price ? qty * price : 0);
        const pnl   = tx.pnl ?? tx.profitLoss ?? null;
        const time  = tx.time ?? (tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

        return (
          <div key={tx._id ?? tx.id ?? i}
            style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 80px 120px 120px 1fr", gap: "8px", alignItems: "center", padding: "13px 24px", borderBottom: "1px solid #1a2540", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#131d30"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div>
              <span style={{ display: "inline-block", fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "6px", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: "0.06em" }}>{cfg.label}</span>
            </div>
            <div>
              {tx.symbol
                ? <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                    {pnl !== null && <div style={{ fontSize: "10px", color: pnl >= 0 ? "#00e5a0" : "#ff4d6d", fontWeight: "600", marginTop: "1px" }}>P&L: {pnl >= 0 ? "+" : ""}₹{Number(pnl).toLocaleString("en-IN")}</div>}
                  </div>
                : <span style={{ fontSize: "13px", color: "#64748b" }}>Virtual deposit</span>}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: qty ? "#e2e8f0" : "#374151" }}>{qty ?? "—"}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>{price ? `₹${Number(price).toLocaleString("en-IN")}` : "—"}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "600", color: tx.type === "DEPOSIT" ? "#2d7ef7" : isBuy ? "#ff4d6d" : "#00e5a0" }}>
              {tx.type === "DEPOSIT" ? "+" : isBuy ? "-" : "+"}₹{Number(ttl).toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>{time}</div>
          </div>
        );
      })}

      {total > 1 && (
        <div style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1a2540" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Page {page} of {total} · {filtered.length} transactions</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {[["← Prev", -1], ["Next →", 1]].map(([label, dir]) => {
              const disabled = dir === -1 ? page === 1 : page === total;
              return (
                <button key={label} onClick={() => setPage(p => p + dir)} disabled={disabled}
                  style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "8px", color: disabled ? "#374151" : "#94a3b8", fontFamily: "'Poppins', sans-serif", fontSize: "12px", padding: "5px 12px", cursor: disabled ? "not-allowed" : "pointer" }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;