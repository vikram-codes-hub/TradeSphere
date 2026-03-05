import { useState } from "react";

const STOCKS = [
  { symbol: "RELIANCE.NS",   name: "Reliance Industries",  exchange: "NSE"    },
  { symbol: "TCS.NS",        name: "Tata Consultancy",     exchange: "NSE"    },
  { symbol: "INFY.NS",       name: "Infosys",              exchange: "NSE"    },
  { symbol: "HDFCBANK.NS",   name: "HDFC Bank",            exchange: "NSE"    },
  { symbol: "WIPRO.NS",      name: "Wipro",                exchange: "NSE"    },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors",          exchange: "NSE"    },
  { symbol: "ICICIBANK.NS",  name: "ICICI Bank",           exchange: "NSE"    },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance",        exchange: "NSE"    },
  { symbol: "ADANIENT.NS",   name: "Adani Enterprises",    exchange: "NSE"    },
  { symbol: "SUNPHARMA.NS",  name: "Sun Pharmaceutical",   exchange: "NSE"    },
  { symbol: "AAPL",          name: "Apple Inc.",           exchange: "NASDAQ" },
  { symbol: "TSLA",          name: "Tesla Inc.",           exchange: "NASDAQ" },
  { symbol: "MSFT",          name: "Microsoft Corp.",      exchange: "NASDAQ" },
  { symbol: "GOOGL",         name: "Alphabet Inc.",        exchange: "NASDAQ" },
  { symbol: "AMZN",          name: "Amazon.com Inc.",      exchange: "NASDAQ" },
];

const StockSelector = ({ selected, onSelect, onRun, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = STOCKS.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStock = STOCKS.find(s => s.symbol === selected);

  return (
    <div style={{
      background:   "#0e1525",
      border:       "1px solid #1a2540",
      borderRadius: "16px",
      padding:      "24px",
      marginBottom: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "16px" }}>🎯</span>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Select Stock to Predict
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Custom dropdown */}
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          {/* Trigger */}
          <div
            onClick={() => setOpen(o => !o)}
            style={{
              background:     "#090e1a",
              border:         `1px solid ${open ? "#2d7ef7" : "#1a2540"}`,
              borderRadius:   "12px",
              padding:        "12px 16px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              cursor:         "pointer",
              transition:     "border-color 0.2s",
              boxShadow:      open ? "0 0 0 3px rgba(45,126,247,0.12)" : "none",
            }}
          >
            {selectedStock ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(45,126,247,0.12)", border: "1px solid rgba(45,126,247,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: "700", color: "#2d7ef7",
                }}>
                  {selectedStock.symbol.replace(".NS", "").slice(0, 3)}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#e2e8f0" }}>
                    {selectedStock.symbol.replace(".NS", "")}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{selectedStock.name}</div>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: "14px", color: "#64748b" }}>Choose a stock...</span>
            )}
            <span style={{ color: "#64748b", fontSize: "12px", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </div>

          {/* Dropdown panel */}
          {open && (
            <div style={{
              position:     "absolute",
              top:          "calc(100% + 8px)",
              left:         0,
              right:        0,
              background:   "#0e1525",
              border:       "1px solid #1a2540",
              borderRadius: "12px",
              zIndex:       100,
              overflow:     "hidden",
              boxShadow:    "0 16px 40px rgba(0,0,0,0.5)",
            }}>
              {/* Search */}
              <div style={{ padding: "10px" }}>
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search stocks..."
                  style={{
                    width:        "100%",
                    background:   "#090e1a",
                    border:       "1px solid #1a2540",
                    borderRadius: "8px",
                    color:        "#e2e8f0",
                    fontFamily:   "'Poppins', sans-serif",
                    fontSize:     "13px",
                    padding:      "8px 12px",
                    outline:      "none",
                  }}
                />
              </div>

              {/* Options */}
              <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {filtered.map(s => {
                  const isSelected = s.symbol === selected;
                  const short      = s.symbol.replace(".NS", "");
                  const exColor    = s.exchange === "NSE" ? "#2d7ef7" : "#a78bfa";

                  return (
                    <div
                      key={s.symbol}
                      onClick={() => { onSelect(s.symbol); setOpen(false); setSearch(""); }}
                      style={{
                        display:     "flex",
                        alignItems:  "center",
                        gap:         "10px",
                        padding:     "10px 14px",
                        cursor:      "pointer",
                        background:  isSelected ? "rgba(45,126,247,0.08)" : "transparent",
                        borderLeft:  isSelected ? "2px solid #2d7ef7" : "2px solid transparent",
                        transition:  "background 0.15s",
                      }}
                      onMouseEnter={e => !isSelected && (e.currentTarget.style.background = "#131d30")}
                      onMouseLeave={e => !isSelected && (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "7px",
                        background: `${exColor}18`, border: `1px solid ${exColor}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px", fontWeight: "700", color: exColor, flexShrink: 0,
                      }}>
                        {short.slice(0, 3)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{short}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{s.name}</div>
                      </div>
                      <span style={{
                        fontSize: "9px", fontWeight: "600",
                        padding: "2px 6px", borderRadius: "4px",
                        background: `${exColor}18`, color: exColor,
                      }}>
                        {s.exchange}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={!selected || loading}
          style={{
            background:   !selected || loading ? "#1a2540" : "linear-gradient(135deg, #a78bfa, #2d7ef7)",
            border:       "none",
            borderRadius: "12px",
            color:        !selected || loading ? "#64748b" : "#fff",
            fontFamily:   "'Poppins', sans-serif",
            fontSize:     "14px",
            fontWeight:   "700",
            padding:      "12px 28px",
            cursor:       !selected || loading ? "not-allowed" : "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          "8px",
            boxShadow:    !selected || loading ? "none" : "0 4px 20px rgba(167,139,250,0.3)",
            transition:   "all 0.2s",
            whiteSpace:   "nowrap",
          }}
        >
          {loading ? (
            <>
              <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              Running Model...
            </>
          ) : (
            <>🤖 Run Prediction</>
          )}
        </button>
      </div>

      {/* Info bar */}
      <div style={{ display: "flex", gap: "20px", marginTop: "16px", flexWrap: "wrap" }}>
        {[
          { icon: "🧠", text: "Random Forest model" },
          { icon: "📊", text: "365 days training data" },
          { icon: "⚡", text: "~3 second response" },
          { icon: "🎯", text: "Next-day price prediction" },
        ].map((item) => (
          <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "13px" }}>{item.icon}</span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>{item.text}</span>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default StockSelector;