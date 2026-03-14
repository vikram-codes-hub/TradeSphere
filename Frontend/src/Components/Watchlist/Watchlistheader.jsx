import { useState } from "react";

const WatchlistHeader = ({ count, onSearch, onSort, sortBy, onAddSymbol, addLoading }) => {
  const [inputVal,   setInputVal]   = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [newSymbol,  setNewSymbol]  = useState("");

  const handleSearch = (e) => { setInputVal(e.target.value); onSearch(e.target.value); };

  const handleAdd = () => {
    if (newSymbol.trim() && !addLoading) {
      onAddSymbol(newSymbol.trim().toUpperCase());
      setNewSymbol("");
      setShowAdd(false);
    }
  };

  const sortOptions = ["Default", "Price ↑", "Price ↓", "Change %", "Volume"];

  return (
    <div style={{ borderBottom: "1px solid #1e2d3d", padding: "28px 32px 20px" }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <div style={{ color: "#f0b429", fontSize: "10px", letterSpacing: "4px", fontFamily: "monospace", marginBottom: "4px" }}>TRADESPHERE</div>
          <h1 style={{ fontFamily: '"Georgia", serif', fontSize: "38px", color: "#e8eaed", letterSpacing: "-1px", lineHeight: 1 }}>Watchlist</h1>
          <p style={{ color: "#4a6580", fontSize: "12px", fontFamily: "monospace", marginTop: "4px" }}>
            {count} stock{count !== 1 ? "s" : ""} tracked · Live prices
          </p>
        </div>

        <button onClick={() => setShowAdd(!showAdd)}
          style={{ background: showAdd ? "#f0b429" : "transparent", border: "1px solid #f0b42960", borderRadius: "8px", padding: "9px 18px", color: showAdd ? "#000" : "#f0b429", fontFamily: "monospace", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { if (!showAdd) e.currentTarget.style.background = "#f0b42915"; }}
          onMouseLeave={e => { if (!showAdd) e.currentTarget.style.background = "transparent"; }}>
          + ADD SYMBOL
        </button>
      </div>

      {/* Add symbol input */}
      {showAdd && (
        <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input value={newSymbol} onChange={e => setNewSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="e.g. RELIANCE.NS, AAPL, TSLA"
            style={{ flex: 1, maxWidth: "320px", background: "#0a1929", border: "1px solid #f0b42940", borderRadius: "8px", padding: "9px 14px", color: "#e8eaed", fontFamily: "monospace", fontSize: "13px", outline: "none" }} />
          <button onClick={handleAdd} disabled={addLoading}
            style={{ background: addLoading ? "#7a5c1a" : "#f0b429", color: "#000", border: "none", borderRadius: "8px", padding: "9px 20px", fontFamily: "monospace", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", cursor: addLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {addLoading
              ? <><span style={{ width: "12px", height: "12px", border: "2px solid #00000030", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />ADDING...</>
              : "TRACK"}
          </button>
          <button onClick={() => setShowAdd(false)}
            style={{ background: "transparent", color: "#4a6580", border: "1px solid #1e2d3d", borderRadius: "8px", padding: "9px 14px", fontFamily: "monospace", fontSize: "12px", cursor: "pointer" }}>
            CANCEL
          </button>
        </div>
      )}

      {/* Search + Sort */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#4a6580", fontSize: "14px" }}>⌕</span>
          <input value={inputVal} onChange={handleSearch} placeholder="Search symbol or name..."
            style={{ width: "100%", background: "#0a1929", border: "1px solid #1e2d3d", borderRadius: "8px", padding: "9px 14px 9px 34px", color: "#e8eaed", fontFamily: "monospace", fontSize: "13px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "#f0b42960"}
            onBlur={e  => e.target.style.borderColor = "#1e2d3d"} />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {sortOptions.map(opt => (
            <button key={opt} onClick={() => onSort(opt)}
              style={{ background: sortBy === opt ? "#f0b42920" : "transparent", border: `1px solid ${sortBy === opt ? "#f0b42960" : "#1e2d3d"}`, borderRadius: "6px", padding: "6px 12px", color: sortBy === opt ? "#f0b429" : "#4a6580", fontFamily: "monospace", fontSize: "10px", fontWeight: "600", letterSpacing: "1px", cursor: "pointer", transition: "all 0.15s" }}>
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default WatchlistHeader;