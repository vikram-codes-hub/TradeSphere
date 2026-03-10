import StockRow from "./Stockrow.jsx";

// ✅ Keys match MarketsContext sortBy values
const COLUMNS = [
  { label: "#",        key: null          },
  { label: "Stock",    key: null          },
  { label: "Price",    key: "price"       },
  { label: "Change",   key: "change"      },
  { label: "% Change", key: "change"      },
  { label: "Volume",   key: "volume"      },
  { label: "7D Chart", key: null          },
  { label: "",         key: null          },
];

const thStyle = {
  fontSize: "10px", fontWeight: "700", color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.08em",
  padding: "12px 8px", userSelect: "none", whiteSpace: "nowrap",
};

const SkeletonRow = ({ i }) => (
  <div style={{ display: "grid", gridTemplateColumns: "40px 2fr 1.2fr 1fr 1fr 1fr 100px 44px", alignItems: "center", gap: "8px", padding: "13px 20px", borderBottom: "1px solid #1a2540" }}>
    {[20, 180, 80, 70, 80, 60, 80, 34].map((w, j) => (
      <div key={j} style={{ height: "14px", width: `${w}px`, background: "#1a2540", borderRadius: "4px", animation: "shimmer 1.5s infinite", animationDelay: `${(i + j) * 0.04}s` }} />
    ))}
    <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
  </div>
);

const StockTable = ({ stocks, sortBy, setSortBy, watchlist, onToggleWatchlist, loading }) => {
  const Header = () => (
    <div style={{ display: "grid", gridTemplateColumns: "40px 2fr 1.2fr 1fr 1fr 1fr 100px 44px", gap: "8px", padding: "0 20px", borderBottom: "1px solid #1a2540", background: "#0a1020" }}>
      {COLUMNS.map((col, i) => (
        <div
          key={i}
          onClick={() => col.key && setSortBy(col.key)}
          style={{ ...thStyle, cursor: col.key ? "pointer" : "default", color: sortBy === col.key ? "#2d7ef7" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}
        >
          {col.label}
          {col.key && (
            <span style={{ fontSize: "9px", opacity: sortBy === col.key ? 1 : 0.3 }}>▼</span>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
        <Header />
        {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)}
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>No stocks found</div>
        <div style={{ fontSize: "13px", color: "#64748b" }}>Try a different search or filter</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
      <Header />
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