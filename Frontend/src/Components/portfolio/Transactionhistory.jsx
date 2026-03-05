import { useState } from "react";

const MOCK_TRANSACTIONS = [
  { id: 1,  type: "BUY",      symbol: "RELIANCE.NS", qty: 5,  price: 2941,  total: 14705,  time: "2 mins ago",  pnl: null     },
  { id: 2,  type: "SELL",     symbol: "WIPRO.NS",    qty: 10, price: 452,   total: 4520,   time: "1 hr ago",    pnl: 680      },
  { id: 3,  type: "BUY",      symbol: "TSLA",        qty: 1,  price: 18420, total: 18420,  time: "3 hrs ago",   pnl: null     },
  { id: 4,  type: "BUY",      symbol: "TCS.NS",      qty: 2,  price: 3892,  total: 7784,   time: "Yesterday",   pnl: null     },
  { id: 5,  type: "SELL",     symbol: "AAPL",        qty: 1,  price: 18100, total: 18100,  time: "2 days ago",  pnl: 900      },
  { id: 6,  type: "DEPOSIT",  symbol: null,          qty: null,price: null, total: 50000,  time: "3 days ago",  pnl: null     },
  { id: 7,  type: "BUY",      symbol: "INFY.NS",     qty: 4,  price: 1842,  total: 7368,   time: "4 days ago",  pnl: null     },
  { id: 8,  type: "SELL",     symbol: "HDFCBANK.NS", qty: 3,  price: 1623,  total: 4869,   time: "5 days ago",  pnl: -210     },
  { id: 9,  type: "BUY",      symbol: "MSFT",        qty: 1,  price: 39800, total: 39800,  time: "1 week ago",  pnl: null     },
  { id: 10, type: "DEPOSIT",  symbol: null,          qty: null,price: null, total: 100000, time: "2 weeks ago", pnl: null     },
];

const TYPE_CONFIG = {
  BUY:      { label: "BUY",     bg: "rgba(0,229,160,0.1)",   color: "#00e5a0", border: "rgba(0,229,160,0.25)"   },
  SELL:     { label: "SELL",    bg: "rgba(255,77,109,0.1)",  color: "#ff4d6d", border: "rgba(255,77,109,0.25)"  },
  DEPOSIT:  { label: "DEP",     bg: "rgba(45,126,247,0.1)",  color: "#2d7ef7", border: "rgba(45,126,247,0.25)"  },
  WITHDRAWAL:{ label: "WDR",   bg: "rgba(255,209,102,0.1)", color: "#ffd166", border: "rgba(255,209,102,0.25)" },
};

const TransactionHistory = ({ transactions = MOCK_TRANSACTIONS }) => {
  const [filter, setFilter] = useState("ALL");
  const [page,   setPage]   = useState(1);
  const PER_PAGE = 6;

  const filters = ["ALL", "BUY", "SELL", "DEPOSIT"];

  const filtered = filter === "ALL"
    ? transactions
    : transactions.filter(t => t.type === filter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      overflow:     "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding:        "20px 24px",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        borderBottom:   "1px solid #1a2540",
        flexWrap:       "wrap",
        gap:            "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📋</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Transaction History
          </span>
        </div>

        {/* Filter tabs */}
        <div style={{
          display:      "flex",
          background:   "#090e1a",
          border:       "1px solid #1a2540",
          borderRadius: "10px",
          padding:      "3px",
          gap:          "2px",
        }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              style={{
                background:   filter === f ? "#1a2540" : "transparent",
                border:       "none",
                borderRadius: "7px",
                color:        filter === f ? "#e2e8f0" : "#64748b",
                fontSize:     "11px",
                fontWeight:   "600",
                padding:      "5px 12px",
                cursor:       "pointer",
                fontFamily:   "'Poppins', sans-serif",
                transition:   "all 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "80px 1.5fr 80px 120px 120px 120px",
        gap:                 "8px",
        padding:             "10px 24px",
        background:          "#0a1020",
        borderBottom:        "1px solid #1a2540",
      }}>
        {["Type", "Stock", "Qty", "Price", "Total", "Time"].map((h) => (
          <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div>
        {paginated.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
            No transactions found
          </div>
        ) : (
          paginated.map((tx) => {
            const cfg   = TYPE_CONFIG[tx.type];
            const isBuy = tx.type === "BUY";
            const short = tx.symbol ? tx.symbol.replace(".NS", "") : "—";

            return (
              <div
                key={tx.id}
                style={{
                  display:             "grid",
                  gridTemplateColumns: "80px 1.5fr 80px 120px 120px 120px",
                  gap:                 "8px",
                  alignItems:          "center",
                  padding:             "13px 24px",
                  borderBottom:        "1px solid #1a2540",
                  transition:          "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#131d30"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Type badge */}
                <div>
                  <span style={{
                    display:      "inline-block",
                    fontSize:     "10px",
                    fontWeight:   "700",
                    padding:      "3px 9px",
                    borderRadius: "6px",
                    background:   cfg.bg,
                    color:        cfg.color,
                    border:       `1px solid ${cfg.border}`,
                    letterSpacing:"0.06em",
                  }}>
                    {cfg.label}
                  </span>
                </div>

                {/* Stock */}
                <div>
                  {tx.symbol ? (
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                      {tx.pnl !== null && (
                        <div style={{ fontSize: "10px", color: tx.pnl >= 0 ? "#00e5a0" : "#ff4d6d", fontWeight: "600", marginTop: "1px" }}>
                          P&L: {tx.pnl >= 0 ? "+" : ""}₹{tx.pnl}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: "13px", color: "#64748b" }}>Virtual deposit</span>
                  )}
                </div>

                {/* Qty */}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: tx.qty ? "#e2e8f0" : "#374151" }}>
                  {tx.qty ?? "—"}
                </div>

                {/* Price */}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: tx.price ? "#94a3b8" : "#374151" }}>
                  {tx.price ? `₹${tx.price.toLocaleString("en-IN")}` : "—"}
                </div>

                {/* Total */}
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize:   "13px",
                  fontWeight: "600",
                  color: tx.type === "DEPOSIT" ? "#2d7ef7"
                       : isBuy               ? "#ff4d6d"
                       :                       "#00e5a0",
                }}>
                  {tx.type === "DEPOSIT" ? "+" : isBuy ? "-" : "+"}₹{tx.total.toLocaleString("en-IN")}
                </div>

                {/* Time */}
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {tx.time}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          padding:        "14px 24px",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          borderTop:      "1px solid #1a2540",
        }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Page {page} of {totalPages} · {filtered.length} transactions
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                background: "transparent", border: "1px solid #1a2540", borderRadius: "8px",
                color: page === 1 ? "#374151" : "#94a3b8", fontFamily: "'Poppins', sans-serif",
                fontSize: "12px", padding: "5px 12px", cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                background: "transparent", border: "1px solid #1a2540", borderRadius: "8px",
                color: page === totalPages ? "#374151" : "#94a3b8", fontFamily: "'Poppins', sans-serif",
                fontSize: "12px", padding: "5px 12px", cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;