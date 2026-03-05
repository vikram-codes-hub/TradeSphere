import { useState, useEffect, useMemo } from "react";
import MarketSummaryBar from "../Components/market/MarketSummaryBar.jsx";
import MarketSearchBar  from "../Components/market/MarketSearchBar.jsx";
import StockTable       from "../Components/market/StockTable.jsx";

/* ── Mock stock data — replace with API + Socket.IO ─────── */
const generateSparkline = (base, len = 14) => {
  const arr = [base];
  for (let i = 1; i < len; i++) {
    const delta = (Math.random() - 0.48) * base * 0.015;
    arr.push(Math.max(arr[i - 1] + delta, base * 0.8));
  }
  return arr;
};

const MOCK_STOCKS = [
  { symbol: "RELIANCE.NS",   name: "Reliance Industries",  exchange: "NSE",    sector: "Energy",      price: 2941,  change: 41.2,  changePct: 1.62,  volume: 2140000, marketCap: 19900000000, isHalted: false },
  { symbol: "TCS.NS",        name: "Tata Consultancy",     exchange: "NSE",    sector: "Technology",  price: 3892,  change: 106.4, changePct: 2.81,  volume: 1430000, marketCap: 14100000000, isHalted: false },
  { symbol: "INFY.NS",       name: "Infosys",              exchange: "NSE",    sector: "Technology",  price: 1842,  change: 22.1,  changePct: 1.22,  volume: 3200000, marketCap: 7650000000,  isHalted: false },
  { symbol: "HDFCBANK.NS",   name: "HDFC Bank",            exchange: "NSE",    sector: "Banking",     price: 1623,  change: -6.4,  changePct: -0.39, volume: 4100000, marketCap: 12300000000, isHalted: false },
  { symbol: "WIPRO.NS",      name: "Wipro",                exchange: "NSE",    sector: "Technology",  price: 452,   change: -8.2,  changePct: -1.78, volume: 2700000, marketCap: 2340000000,  isHalted: false },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors",          exchange: "NSE",    sector: "Automobile",  price: 987,   change: 18.4,  changePct: 1.90,  volume: 5600000, marketCap: 3610000000,  isHalted: false },
  { symbol: "ICICIBANK.NS",  name: "ICICI Bank",           exchange: "NSE",    sector: "Banking",     price: 1124,  change: 12.8,  changePct: 1.15,  volume: 3800000, marketCap: 7890000000,  isHalted: false },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance",        exchange: "NSE",    sector: "Finance",     price: 6870,  change: -62.4, changePct: -0.90, volume: 890000,  marketCap: 4130000000,  isHalted: false },
  { symbol: "ADANIENT.NS",   name: "Adani Enterprises",   exchange: "NSE",    sector: "Conglomerate",price: 2340,  change: -74.8, changePct: -3.10, volume: 1200000, marketCap: 2670000000,  isHalted: false },
  { symbol: "SUNPHARMA.NS",  name: "Sun Pharmaceutical",  exchange: "NSE",    sector: "Pharma",      price: 1678,  change: 8.4,   changePct: 0.50,  volume: 1560000, marketCap: 4010000000,  isHalted: false },
  { symbol: "AAPL",          name: "Apple Inc.",           exchange: "NASDAQ", sector: "Technology",  price: 18100, change: 241.2, changePct: 1.35,  volume: 8900000, marketCap: 290000000000,isHalted: false },
  { symbol: "TSLA",          name: "Tesla Inc.",           exchange: "NASDAQ", sector: "Automobile",  price: 18420, change: 742.4, changePct: 4.20,  volume: 12400000,marketCap: 58000000000, isHalted: false },
  { symbol: "MSFT",          name: "Microsoft Corp.",      exchange: "NASDAQ", sector: "Technology",  price: 39800, change: 312.1, changePct: 0.79,  volume: 7200000, marketCap: 296000000000,isHalted: false },
  { symbol: "GOOGL",         name: "Alphabet Inc.",        exchange: "NASDAQ", sector: "Technology",  price: 15420, change: 124.8, changePct: 0.82,  volume: 4500000, marketCap: 193000000000,isHalted: false },
  { symbol: "AMZN",          name: "Amazon.com Inc.",      exchange: "NASDAQ", sector: "E-Commerce",  price: 17800, change: -198.4,changePct: -1.10, volume: 6700000, marketCap: 184000000000,isHalted: false },
].map(s => ({ ...s, sparkline: generateSparkline(s.price) }));

/* ============================================================
   MARKETS PAGE
   ============================================================ */
const MarketsPage = () => {
  const [stocks,    setStocks]    = useState(MOCK_STOCKS);
  const [search,    setSearch]    = useState("");
  const [exchange,  setExchange]  = useState("All");
  const [sortBy,    setSortBy]    = useState("marketCap");
  const [watchlist, setWatchlist] = useState(["INFY.NS", "HDFCBANK.NS"]);
  const [lastSync,  setLastSync]  = useState(new Date());
  const [syncing,   setSyncing]   = useState(false);

  // Simulate live price updates every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => {
        setStocks(prev => prev.map(s => {
          const delta    = (Math.random() - 0.49) * s.price * 0.008;
          const newPrice = parseFloat((s.price + delta).toFixed(2));
          const newChange = parseFloat((s.change + delta * 0.3).toFixed(2));
          const newPct    = parseFloat(((newChange / (newPrice - newChange)) * 100).toFixed(2));
          const newSparkline = [...s.sparkline.slice(1), newPrice];
          return { ...s, price: newPrice, change: newChange, changePct: newPct, sparkline: newSparkline };
        }));
        setLastSync(new Date());
        setSyncing(false);
      }, 600);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...stocks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    if (exchange !== "All") {
      result = result.filter(s => s.exchange === exchange);
    }

    result.sort((a, b) => {
      if (sortBy === "name")      return a.name.localeCompare(b.name);
      if (sortBy === "price")     return b.price - a.price;
      if (sortBy === "change")    return b.changePct - a.changePct;
      if (sortBy === "changePct") return b.changePct - a.changePct;
      if (sortBy === "volume")    return b.volume - a.volume;
      return b.marketCap - a.marketCap; // default
    });

    return result;
  }, [stocks, search, exchange, sortBy]);

  const syncAgo = Math.round((new Date() - lastSync) / 1000);

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Page header ──────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>
              Markets
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Live stock prices — click any stock to trade
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Sync indicator */}
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "8px",
              background:   "#0e1525",
              border:       "1px solid #1a2540",
              borderRadius: "10px",
              padding:      "8px 14px",
              fontSize:     "12px",
              color:        "#64748b",
            }}>
              <span style={{
                width:       "7px",
                height:      "7px",
                borderRadius:"50%",
                background:  syncing ? "#ffd166" : "#00e5a0",
                display:     "inline-block",
                animation:   "pulse 2s infinite",
                flexShrink:  0,
              }} />
              <span style={{ color: syncing ? "#ffd166" : "#00e5a0", fontWeight: "600" }}>
                {syncing ? "Syncing..." : "LIVE"}
              </span>
              <span>Updated {syncAgo}s ago</span>
            </div>

            {/* Watchlist count */}
            <div style={{
              background:   "rgba(255,209,102,0.08)",
              border:       "1px solid rgba(255,209,102,0.2)",
              borderRadius: "10px",
              padding:      "8px 14px",
              fontSize:     "12px",
              fontWeight:   "600",
              color:        "#ffd166",
            }}>
              ⭐ {watchlist.length} Watching
            </div>
          </div>
        </div>

        {/* ── Market summary ───────────────────────────────── */}
        <MarketSummaryBar stocks={stocks} />

        {/* ── Search + filters ─────────────────────────────── */}
        <MarketSearchBar
          search={search}     setSearch={setSearch}
          exchange={exchange} setExchange={setExchange}
          sortBy={sortBy}     setSortBy={setSortBy}
        />

        {/* ── Results count ────────────────────────────────── */}
        <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Showing <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{filtered.length}</span> of {stocks.length} stocks
            {exchange !== "All" && ` on ${exchange}`}
            {search && ` matching "${search}"`}
          </span>
          {(search || exchange !== "All") && (
            <button
              onClick={() => { setSearch(""); setExchange("All"); }}
              style={{
                background:   "transparent",
                border:       "1px solid #1a2540",
                borderRadius: "8px",
                color:        "#64748b",
                fontSize:     "11px",
                fontWeight:   "500",
                padding:      "4px 12px",
                cursor:       "pointer",
                fontFamily:   "'Poppins', sans-serif",
              }}
            >
              Clear filters ✕
            </button>
          )}
        </div>

        {/* ── Stock table ───────────────────────────────────── */}
        <StockTable
          stocks={filtered}
          sortBy={sortBy}
          setSortBy={setSortBy}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
        />

        {/* ── Disclaimer ───────────────────────────────────── */}
        <div style={{
          marginTop:    "24px",
          padding:      "14px 18px",
          background:   "rgba(255,209,102,0.05)",
          border:       "1px solid rgba(255,209,102,0.15)",
          borderRadius: "12px",
          display:      "flex",
          alignItems:   "center",
          gap:          "10px",
        }}>
          <span style={{ fontSize: "16px" }}>💡</span>
          <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
            All trades use <strong style={{ color: "#ffd166" }}>virtual money</strong> only. Prices sync from Yahoo Finance every 60 seconds.
            Data shown is for simulation purposes only — not financial advice.
          </span>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};

export default MarketsPage;