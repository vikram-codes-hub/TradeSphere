import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StockHeader          from "../Components/Main_trade/StockHeader.jsx";
import PriceChart           from "../Components/Main_trade/PriceChart.jsx";
import OHLCVBar             from "../Components/Main_trade/OHLCVBar.jsx";
import OrderPanel           from "../Components/Main_trade/Orderpanel.jsx"
import { StockDetails, OrderBook, YourPosition } from "../Components/Main_trade/StockInfo.jsx";

/* ── Mock stock data — replace with API ─────────────────── */
const STOCK_DATA = {
  "RELIANCE.NS": { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE",    sector: "Energy",      price: 2941,  change: 41.2,  changePct: 1.62,  open: 2910, high: 2965, low: 2898, close: 2900,  volume: 2140000, marketCap: 19900000000000, high52w: 3217,  low52w: 2221, prevClose: 2900, pe: 28.4, isHalted: false },
  "TCS.NS":      { symbol: "TCS.NS",      name: "Tata Consultancy",    exchange: "NSE",    sector: "Technology",  price: 3892,  change: 106.4, changePct: 2.81,  open: 3800, high: 3920, low: 3780, close: 3786,  volume: 1430000, marketCap: 14100000000000, high52w: 4200,  low52w: 3100, prevClose: 3786, pe: 31.2, isHalted: false },
  "INFY.NS":     { symbol: "INFY.NS",     name: "Infosys",             exchange: "NSE",    sector: "Technology",  price: 1842,  change: 22.1,  changePct: 1.22,  open: 1820, high: 1855, low: 1810, close: 1820,  volume: 3200000, marketCap: 7650000000000,  high52w: 1992,  low52w: 1351, prevClose: 1820, pe: 24.8, isHalted: false },
  "HDFCBANK.NS": { symbol: "HDFCBANK.NS", name: "HDFC Bank",           exchange: "NSE",    sector: "Banking",     price: 1623,  change: -6.4,  changePct: -0.39, open: 1635, high: 1648, low: 1612, close: 1629,  volume: 4100000, marketCap: 12300000000000, high52w: 1794,  low52w: 1363, prevClose: 1629, pe: 18.9, isHalted: false },
  "WIPRO.NS":    { symbol: "WIPRO.NS",    name: "Wipro",               exchange: "NSE",    sector: "Technology",  price: 452,   change: -8.2,  changePct: -1.78, open: 462,  high: 465,  low: 448,  close: 460,   volume: 2700000, marketCap: 2340000000000,  high52w: 567,   low52w: 374,  prevClose: 460,  pe: 19.2, isHalted: false },
  "TATAMOTORS.NS":{ symbol:"TATAMOTORS.NS",name:"Tata Motors",          exchange: "NSE",   sector: "Automobile",  price: 987,   change: 18.4,  changePct: 1.9,   open: 970,  high: 995,  low: 965,  close: 969,   volume: 5600000, marketCap: 3610000000000,  high52w: 1179,  low52w: 644,  prevClose: 969,  pe: 8.4,  isHalted: false },
  "TSLA":        { symbol: "TSLA",        name: "Tesla Inc.",           exchange: "NASDAQ", sector: "Automobile",  price: 18420, change: 742.4, changePct: 4.20,  open: 17800,high: 18650,low: 17600,close: 17678, volume: 12400000,marketCap: 58000000000000,  high52w: 21400, low52w: 9820, prevClose: 17678,pe: 72.1, isHalted: false },
  "AAPL":        { symbol: "AAPL",        name: "Apple Inc.",           exchange: "NASDAQ", sector: "Technology",  price: 18100, change: 241.2, changePct: 1.35,  open: 17900,high: 18200,low: 17820,close: 17859, volume: 8900000, marketCap: 290000000000000, high52w: 19800, low52w: 14300,prevClose: 17859,pe: 29.4, isHalted: false },
  "MSFT":        { symbol: "MSFT",        name: "Microsoft Corp.",      exchange: "NASDAQ", sector: "Technology",  price: 39800, change: 312.1, changePct: 0.79,  open: 39500,high: 40100,low: 39400,close: 39488, volume: 7200000, marketCap: 296000000000000, high52w: 43200, low52w: 33100,prevClose: 39488,pe: 34.1, isHalted: false },
  "GOOGL":       { symbol: "GOOGL",       name: "Alphabet Inc.",        exchange: "NASDAQ", sector: "Technology",  price: 15420, change: 124.8, changePct: 0.82,  open: 15300,high: 15500,low: 15200,close: 15295, volume: 4500000, marketCap: 193000000000000, high52w: 17200, low52w: 12100,prevClose: 15295,pe: 22.8, isHalted: false },
  "AMZN":        { symbol: "AMZN",        name: "Amazon.com Inc.",      exchange: "NASDAQ", sector: "E-Commerce",  price: 17800, change: -198.4,changePct: -1.10, open: 18100,high: 18150,low: 17700,close: 17998, volume: 6700000, marketCap: 184000000000000, high52w: 20100, low52w: 12800,prevClose: 17998,pe: 41.2, isHalted: false },
};

/* Mock user holdings — replace with context/API */
const MOCK_POSITIONS = {
  "RELIANCE.NS": { quantity: 10, avgBuyPrice: 2800 },
  "TCS.NS":      { quantity: 5,  avgBuyPrice: 3750 },
  "AAPL":        { quantity: 3,  avgBuyPrice: 17200 },
  "TSLA":        { quantity: 2,  avgBuyPrice: 17500 },
};

const CASH_BALANCE = 44370;

/* ============================================================
   TRADE PAGE
   ============================================================ */
const TradePage = () => {
  const { symbol }   = useParams();
  const navigate     = useNavigate();
  const [stock, setStock]       = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [orders, setOrders]     = useState([]);

  // Simulate live price tick every 5s
  useEffect(() => {
    const base = STOCK_DATA[symbol] || STOCK_DATA[symbol + ".NS"];
    if (!base) { setNotFound(true); return; }
    setStock(base);

    const interval = setInterval(() => {
      setStock(prev => {
        if (!prev) return prev;
        const delta    = (Math.random() - 0.49) * prev.price * 0.003;
        const newPrice = parseFloat((prev.price + delta).toFixed(2));
        const newChange= parseFloat((newPrice - prev.prevClose).toFixed(2));
        const newPct   = parseFloat(((newChange / prev.prevClose) * 100).toFixed(2));
        return { ...prev, price: newPrice, change: newChange, changePct: newPct };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  const handleOrderPlace = (order) => {
    setOrders(prev => [order, ...prev]);
  };

  // Not found state
  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "#090e1a", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px" }}>Stock not found</div>
          <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>"{symbol}" is not in our tracked stocks</div>
          <button onClick={() => navigate("/market")} style={{ background: "#2d7ef7", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: "14px", fontWeight: "600", padding: "10px 24px", cursor: "pointer" }}>
            Browse Markets →
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!stock) {
    return (
      <div style={{ minHeight: "100vh", background: "#090e1a", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #1a2540", borderTop: "3px solid #2d7ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: "14px", color: "#64748b" }}>Loading market data...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const position = MOCK_POSITIONS[stock.symbol] || null;

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Stock header ──────────────────────────────────── */}
        <StockHeader stock={stock} />

        {/* ── Main grid: chart + order panel ───────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px", marginBottom: "16px" }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <PriceChart stock={stock} />
            <OHLCVBar   stock={stock} />
          </div>

          {/* Right column — order panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <OrderPanel
              stock={stock}
              position={position}
              cashBalance={CASH_BALANCE}
              onOrderPlace={handleOrderPlace}
            />
            <YourPosition stock={stock} position={position} />
          </div>
        </div>

        {/* ── Bottom grid: stock details + order book ───────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <StockDetails stock={stock} />
          <OrderBook    stock={stock} />
        </div>

        {/* ── Recent orders this session ────────────────────── */}
        {orders.length > 0 && (
          <div style={{
            background:   "#0e1525",
            border:       "1px solid #1a2540",
            borderRadius: "16px",
            overflow:     "hidden",
          }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a2540", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Orders This Session
              </span>
            </div>
            {orders.map((o, i) => (
              <div key={i} style={{
                display:      "flex",
                alignItems:   "center",
                justifyContent:"space-between",
                padding:      "12px 24px",
                borderBottom: i < orders.length - 1 ? "1px solid #1a2540" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px",
                    background: o.type === "BUY" ? "rgba(0,229,160,0.1)"  : "rgba(255,77,109,0.1)",
                    color:      o.type === "BUY" ? "#00e5a0"               : "#ff4d6d",
                    border:     o.type === "BUY" ? "1px solid rgba(0,229,160,0.25)" : "1px solid rgba(255,77,109,0.25)",
                  }}>
                    {o.type}
                  </span>
                  <span style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "600" }}>
                    {o.qty} × {o.symbol.replace(".NS", "")} @ ₹{o.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: "700", color: o.type === "BUY" ? "#ff4d6d" : "#00e5a0" }}>
                  {o.type === "BUY" ? "-" : "+"}₹{o.total.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TradePage;