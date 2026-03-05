import StockRow from "./Stockrow.jsx";

const COLUMNS = [
  { label: "#",        key: null          },
  { label: "Stock",    key: "name"        },
  { label: "Price",    key: "price"       },
  { label: "Change",   key: "change"      },
  { label: "% Change", key: "changePct"   },
  { label: "Volume",   key: "volume"      },
  { label: "7D Chart", key: null          },
  { label: "",         key: null          },
];

const thStyle = {
  fontSize:      "10px",
  fontWeight:    "700",
  color:         "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding:       "12px 8px",
  userSelect:    "none",
  whiteSpace:    "nowrap",
};

const StockTable = ({ stocks, sortBy, setSortBy, watchlist, onToggleWatchlist }) => {
  const sortableKeys = ["name", "price", "change", "changePct", "volume"];

  if (stocks.length === 0) {
    return (
      <div style={{
        background:   "#0e1525",
        border:       "1px solid #1a2540",
        borderRadius: "16px",
        padding:      "60px 24px",
        textAlign:    "center",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>
          No stocks found
        </div>
        <div style={{ fontSize: "13px", color: "#64748b" }}>
          Try a different search or filter
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      overflow:     "hidden",
    }}>
      {/* Table header */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "40px 2fr 1.2fr 1fr 1fr 1fr 100px 44px",
        gap:                 "8px",
        padding:             "0 20px",
        borderBottom:        "1px solid #1a2540",
        background:          "#0a1020",
      }}>
        {COLUMNS.map((col, i) => (
          <div
            key={i}
            onClick={() => col.key && sortableKeys.includes(col.key) && setSortBy(col.key)}
            style={{
              ...thStyle,
              cursor: col.key && sortableKeys.includes(col.key) ? "pointer" : "default",
              color:  sortBy === col.key ? "#2d7ef7" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {col.label}
            {col.key && sortableKeys.includes(col.key) && (
              <span style={{ fontSize: "9px", opacity: sortBy === col.key ? 1 : 0.3 }}>▼</span>
            )}
          </div>
        ))}
      </div>

      {/* Stock rows */}
      <div>
        {stocks.map((stock, i) => (
          <StockRow
            key={stock.symbol}
            stock={stock}
            index={i}
            watchlist={watchlist}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
};

export default StockTable;