import { MarketsProvider, useMarkets } from "../Context/MarketsContext";
import MarketSummaryBar from "../Components/market/MarketSummaryBar.jsx";
import MarketSearchBar  from "../Components/market/MarketSearchBar.jsx";
import StockTable       from "../Components/market/StockTable.jsx";

const MarketsLayout = () => {
  const {
    stocks, allStocks, filteredStocks, watchlist,
    search,   setSearch,
    exchange, setExchange,
    sortBy,   setSortBy,
    loading, searching, error, lastUpdated,
    hasMore, loadMore,
    refresh, toggleWatchlist,
  } = useMarkets();

  const syncAgo = lastUpdated
    ? Math.round((new Date() - lastUpdated) / 1000)
    : null;

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "#090e1a",
      fontFamily:      "'Poppins', sans-serif",
      backgroundImage: "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
      backgroundSize:  "48px 48px",
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Header ───────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.02em", margin: 0 }}>
              Markets
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Live stock prices — click any stock to trade
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0e1525", border: "1px solid #1a2540", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", color: "#64748b" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: loading ? "#ffd166" : "#00e5a0", display: "inline-block", animation: "pulse 2s infinite", flexShrink: 0 }} />
              <span style={{ color: loading ? "#ffd166" : "#00e5a0", fontWeight: "600" }}>
                {loading ? "Syncing..." : "LIVE"}
              </span>
              {syncAgo !== null && !loading && <span>Updated {syncAgo}s ago</span>}
            </div>

            <div style={{ background: "rgba(255,209,102,0.08)", border: "1px solid rgba(255,209,102,0.2)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: "600", color: "#ffd166" }}>
              ⭐ {watchlist.length} Watching
            </div>

            <button
              onClick={refresh}
              disabled={loading}
              style={{ background: "rgba(45,126,247,0.08)", border: "1px solid rgba(45,126,247,0.2)", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: "600", color: "#2d7ef7", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "'Poppins', sans-serif" }}
            >
              ⟳ Refresh
            </button>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────── */}
        {error && (
          <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#ff4d6d" }}>
            ⚠️ {error} — <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={refresh}>Retry</span>
          </div>
        )}

        {/* ── Searching indicator ───────────────────────────── */}
        {searching && (
          <div style={{ background: "rgba(45,126,247,0.06)", border: "1px solid rgba(45,126,247,0.15)", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px", fontSize: "12px", color: "#2d7ef7", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Searching Yahoo Finance...
          </div>
        )}

        {/* ── Summary bar ───────────────────────────────────── */}
        <MarketSummaryBar stocks={allStocks} loading={loading} />

        {/* ── Search + filters ─────────────────────────────── */}
        <MarketSearchBar
          search={search}       setSearch={setSearch}
          exchange={exchange}   setExchange={setExchange}
          sortBy={sortBy}       setSortBy={setSortBy}
        />

        {/* ── Results count ────────────────────────────────── */}
        {!loading && (
          <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Showing <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{stocks.length}</span> of{" "}
              <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{filteredStocks.length}</span> stocks
              {exchange !== "All" && ` on ${exchange}`}
              {search && ` matching "${search}"`}
            </span>
            {(search || exchange !== "All") && (
              <button
                onClick={() => { setSearch(""); setExchange("All"); }}
                style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: "8px", color: "#64748b", fontSize: "11px", fontWeight: "500", padding: "4px 12px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
              >
                Clear filters ✕
              </button>
            )}
          </div>
        )}

        {/* ── Stock table ───────────────────────────────────── */}
        <StockTable
          stocks={stocks}
          sortBy={sortBy}
          setSortBy={setSortBy}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
          loading={loading}
        />

        {/* ── Load More ─────────────────────────────────────── */}
        {!loading && hasMore && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "24px" }}>
            <button
              onClick={loadMore}
              style={{
                background:   "linear-gradient(135deg, rgba(45,126,247,0.1), rgba(45,126,247,0.05))",
                border:       "1px solid rgba(45,126,247,0.3)",
                borderRadius: "12px",
                color:        "#2d7ef7",
                fontSize:     "13px",
                fontWeight:   "600",
                padding:      "12px 32px",
                cursor:       "pointer",
                fontFamily:   "'Poppins', sans-serif",
                transition:   "all 0.2s ease",
                width:        "100%",
                maxWidth:     "320px",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(45,126,247,0.15)"; e.currentTarget.style.borderColor = "rgba(45,126,247,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(45,126,247,0.1), rgba(45,126,247,0.05))"; e.currentTarget.style.borderColor = "rgba(45,126,247,0.3)"; }}
            >
              Load More Stocks ↓
            </button>
            <span style={{ fontSize: "11px", color: "#334155" }}>
              {filteredStocks.length - stocks.length} more stocks available
            </span>
          </div>
        )}

        {/* ── All loaded indicator ──────────────────────────── */}
        {!loading && !hasMore && filteredStocks.length > 20 && (
          <div style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#334155" }}>
            ✓ All {filteredStocks.length} stocks loaded
          </div>
        )}

        {/* ── Disclaimer ───────────────────────────────────── */}
        <div style={{ marginTop: "24px", padding: "14px 18px", background: "rgba(255,209,102,0.05)", border: "1px solid rgba(255,209,102,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>💡</span>
          <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
            All trades use <strong style={{ color: "#ffd166" }}>virtual money</strong> only. Prices sync from Yahoo Finance every 60 seconds. Data shown is for simulation purposes only — not financial advice.
          </span>
        </div>

      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.3)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

const MarketsPage = () => (
  <MarketsProvider>
    <MarketsLayout />
  </MarketsProvider>
);

export default MarketsPage;