import { useState } from "react";

const MarketSearchBar = ({ search, setSearch, exchange, setExchange, sortBy, setSortBy }) => {
  const [focused, setFocused] = useState(false);

  const exchanges = ["All", "NSE", "NASDAQ"];
  const sortOptions = [
    { value: "marketCap", label: "Market Cap" },
    { value: "price",     label: "Price"      },
    { value: "change",    label: "% Change"   },
    { value: "volume",    label: "Volume"     },
  ];

  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          "12px",
      marginBottom: "20px",
      flexWrap:     "wrap",
    }}>
      {/* Search input */}
      <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
        <span style={{
          position:  "absolute",
          left:      "14px",
          top:       "50%",
          transform: "translateY(-50%)",
          fontSize:  "16px",
          pointerEvents: "none",
        }}>
          🔍
        </span>
        <input
          type="text"
          placeholder="Search stocks — RELIANCE, TCS, AAPL..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:        "100%",
            background:   "#0e1525",
            border:       `1px solid ${focused ? "#2d7ef7" : "#1a2540"}`,
            borderRadius: "12px",
            color:        "#e2e8f0",
            fontFamily:   "'Poppins', sans-serif",
            fontSize:     "14px",
            padding:      "11px 14px 11px 42px",
            outline:      "none",
            transition:   "border-color 0.2s, box-shadow 0.2s",
            boxShadow:    focused ? "0 0 0 3px rgba(45,126,247,0.15)" : "none",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position:  "absolute",
              right:     "12px",
              top:       "50%",
              transform: "translateY(-50%)",
              background:"none",
              border:    "none",
              color:     "#64748b",
              fontSize:  "16px",
              cursor:    "pointer",
              lineHeight:"1",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Exchange filter tabs */}
      <div style={{
        display:      "flex",
        background:   "#0e1525",
        border:       "1px solid #1a2540",
        borderRadius: "12px",
        padding:      "4px",
        gap:          "2px",
      }}>
        {exchanges.map((ex) => (
          <button
            key={ex}
            onClick={() => setExchange(ex)}
            style={{
              background:   exchange === ex ? "#2d7ef7" : "transparent",
              border:       "none",
              borderRadius: "9px",
              color:        exchange === ex ? "#fff" : "#64748b",
              fontSize:     "13px",
              fontWeight:   "600",
              padding:      "7px 16px",
              cursor:       "pointer",
              fontFamily:   "'Poppins', sans-serif",
              transition:   "all 0.15s ease",
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", whiteSpace: "nowrap" }}>
          Sort by
        </span>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background:   "#0e1525",
            border:       "1px solid #1a2540",
            borderRadius: "10px",
            color:        "#e2e8f0",
            fontFamily:   "'Poppins', sans-serif",
            fontSize:     "13px",
            fontWeight:   "500",
            padding:      "8px 12px",
            outline:      "none",
            cursor:       "pointer",
          }}
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value} style={{ background: "#0e1525" }}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MarketSearchBar;