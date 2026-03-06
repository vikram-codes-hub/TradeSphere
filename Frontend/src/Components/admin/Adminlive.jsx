import { useState, useEffect } from "react";

/* ============================================================
   LIVE TRADE FEED
   ============================================================ */
const INITIAL_TRADES = [
  { id: 1,  user: "John D.",    type: "BUY",  symbol: "TSLA",        qty: 2,  price: 18420, total: 36840,  time: "2s ago"   },
  { id: 2,  user: "Priya S.",   type: "SELL", symbol: "TCS.NS",      qty: 5,  price: 3892,  total: 19460,  time: "8s ago"   },
  { id: 3,  user: "Alice C.",   type: "BUY",  symbol: "AAPL",        qty: 1,  price: 18100, total: 18100,  time: "15s ago"  },
  { id: 4,  user: "Dev P.",     type: "BUY",  symbol: "RELIANCE.NS", qty: 10, price: 2941,  total: 29410,  time: "22s ago"  },
  { id: 5,  user: "Emma W.",    type: "SELL", symbol: "WIPRO.NS",    qty: 20, price: 452,   total: 9040,   time: "41s ago"  },
  { id: 6,  user: "Rahul V.",   type: "BUY",  symbol: "INFY.NS",     qty: 4,  price: 1842,  total: 7368,   time: "1m ago"   },
];

const NAMES = ["Arun K.", "Meera P.", "Sam T.", "Zara A.", "Kabir M.", "Ananya S.", "Ravi N.", "Lisa C."];
const SYMS  = ["TSLA", "AAPL", "TCS.NS", "RELIANCE.NS", "INFY.NS", "MSFT", "WIPRO.NS", "GOOGL"];
const PRICES= { "TSLA": 18420, "AAPL": 18100, "TCS.NS": 3892, "RELIANCE.NS": 2941, "INFY.NS": 1842, "MSFT": 39800, "WIPRO.NS": 452, "GOOGL": 15420 };

export const LiveTradeFeed = () => {
  const [trades, setTrades] = useState(INITIAL_TRADES);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const sym   = SYMS[Math.floor(Math.random() * SYMS.length)];
      const type  = Math.random() > 0.45 ? "BUY" : "SELL";
      const qty   = Math.floor(1 + Math.random() * 15);
      const price = PRICES[sym];
      const newTrade = {
        id:    Date.now(),
        user:  NAMES[Math.floor(Math.random() * NAMES.length)],
        type,
        symbol: sym,
        qty,
        price,
        total: qty * price,
        time:  "just now",
      };
      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 2500);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a2540", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Trade Feed</span>
          {!paused && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5a0", display: "inline-block", animation: "pulse 2s infinite" }} />}
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          style={{ background: paused ? "rgba(0,229,160,0.1)" : "rgba(255,209,102,0.1)", border: `1px solid ${paused ? "rgba(0,229,160,0.25)" : "rgba(255,209,102,0.25)"}`, borderRadius: "8px", color: paused ? "#00e5a0" : "#ffd166", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: "600", padding: "5px 12px", cursor: "pointer" }}
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {trades.map((trade, i) => {
          const isBuy  = trade.type === "BUY";
          const short  = trade.symbol.replace(".NS", "");
          const isNew  = i === 0 && !paused;

          return (
            <div key={trade.id} style={{
              display:      "flex",
              alignItems:   "center",
              justifyContent:"space-between",
              padding:      "10px 24px",
              borderBottom: "1px solid #1a2540",
              background:   isNew ? "rgba(45,126,247,0.04)" : "transparent",
              transition:   "background 0.5s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", minWidth: "56px" }}>{trade.user}</span>
                <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: isBuy ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)", color: isBuy ? "#00e5a0" : "#ff4d6d", border: `1px solid ${isBuy ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}` }}>
                  {trade.type}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>{trade.qty}×</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>{short}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#64748b" }}>@ ₹{trade.price.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: "700", color: isBuy ? "#ff4d6d" : "#00e5a0" }}>
                  {isBuy ? "-" : "+"}₹{trade.total.toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: "10px", color: "#374151" }}>{trade.time}</span>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)} }`}</style>
    </div>
  );
};

/* ============================================================
   ML JOB MONITOR
   ============================================================ */
const MOCK_JOBS = [
  { id: "job_001", user: "John D.",  symbol: "TSLA",        status: "completed", confidence: 82, duration: "2.4s", time: "2m ago"  },
  { id: "job_002", user: "Priya S.", symbol: "TCS.NS",      status: "running",   confidence: null,duration: "—",  time: "just now"},
  { id: "job_003", user: "Alice C.", symbol: "AAPL",        status: "completed", confidence: 68, duration: "3.1s", time: "5m ago"  },
  { id: "job_004", user: "Dev P.",   symbol: "RELIANCE.NS", status: "failed",    confidence: null,duration: "—",  time: "8m ago"  },
  { id: "job_005", user: "Emma W.",  symbol: "MSFT",        status: "queued",    confidence: null,duration: "—",  time: "just now"},
  { id: "job_006", user: "Rahul V.", symbol: "INFY.NS",     status: "completed", confidence: 74, duration: "2.8s", time: "12m ago" },
];

const STATUS_STYLE = {
  completed: { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",   border: "rgba(0,229,160,0.2)",   label: "✓ Done"     },
  running:   { color: "#2d7ef7", bg: "rgba(45,126,247,0.1)",  border: "rgba(45,126,247,0.2)",  label: "⟳ Running"  },
  queued:    { color: "#ffd166", bg: "rgba(255,209,102,0.1)", border: "rgba(255,209,102,0.2)", label: "◷ Queued"   },
  failed:    { color: "#ff4d6d", bg: "rgba(255,77,109,0.1)",  border: "rgba(255,77,109,0.2)",  label: "✕ Failed"   },
};

export const MLJobMonitor = () => {
  const [jobs] = useState(MOCK_JOBS);

  const counts = {
    running:   jobs.filter(j => j.status === "running").length,
    queued:    jobs.filter(j => j.status === "queued").length,
    completed: jobs.filter(j => j.status === "completed").length,
    failed:    jobs.filter(j => j.status === "failed").length,
  };

  return (
    <div style={{ background: "#0e1525", border: "1px solid #1a2540", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a2540", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🤖</span>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>ML Job Monitor</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {Object.entries(counts).map(([status, count]) => {
            const s = STATUS_STYLE[status];
            return (
              <span key={status} style={{ fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "6px", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {count} {status}
              </span>
            );
          })}
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 100px 120px 100px 80px 80px 80px", gap: "8px", padding: "10px 24px", background: "#0a1020", borderBottom: "1px solid #1a2540" }}>
        {["Job ID", "User", "Symbol", "Status", "Conf.", "Time", "Duration"].map(h => (
          <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
        ))}
      </div>

      {jobs.map((job) => {
        const s = STATUS_STYLE[job.status];
        return (
          <div key={job.id} style={{ display: "grid", gridTemplateColumns: "100px 100px 120px 100px 80px 80px 80px", gap: "8px", alignItems: "center", padding: "11px 24px", borderBottom: "1px solid #1a2540", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#131d30"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#64748b" }}>{job.id}</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{job.user}</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>{job.symbol.replace(".NS", "")}</span>
            <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: "inline-block" }}>
              {s.label}
              {job.status === "running" && <span style={{ marginLeft: "4px", display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: job.confidence ? (job.confidence >= 75 ? "#00e5a0" : "#ffd166") : "#374151" }}>
              {job.confidence ? `${job.confidence}%` : "—"}
            </span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>{job.time}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#64748b" }}>{job.duration}</span>
          </div>
        );
      })}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};