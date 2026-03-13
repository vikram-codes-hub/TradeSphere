const MyRankBanner = ({ myRank }) => {
  // myRank is null while loading or if user has no rank yet
  const rank      = myRank?.rank       ?? null;
  const pnl       = myRank?.totalPnL   ?? myRank?.pnl ?? 0;
  const winRate   = myRank?.winRate    ?? 0;
  const change    = myRank?.change     ?? myRank?.rankChange ?? 0;
  const name      = myRank?.name       ?? myRank?.username ?? "You";
  const avatar    = myRank?.avatar     ?? name.slice(0, 2).toUpperCase();

  const isUp   = change > 0;
  const isDown = change < 0;

  return (
    <div style={{
      position:       "sticky",
      bottom:         0,
      left:           0,
      right:          0,
      background:     "linear-gradient(90deg, #0a1929 0%, #0f2236 50%, #0a1929 100%)",
      borderTop:      "1px solid #f0b42940",
      padding:        "14px 32px",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      zIndex:         50,
      backdropFilter: "blur(12px)",
      flexWrap:       "wrap",
      gap:            "12px",
    }}>
      {/* Avatar + rank */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0d1b2a", border: "1px solid #f0b42940", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontFamily: "monospace", fontWeight: "800", color: "#f0b429" }}>
          {avatar}
        </div>
        <div>
          <div style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1.5px" }}>YOUR POSITION</div>
          <div style={{ color: "#e8eaed", fontFamily: '"Georgia", serif', fontSize: "15px", fontWeight: "bold" }}>
            {rank ? `Rank #${rank}` : "Not ranked yet"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px" }}>P&L</div>
          <div style={{ color: pnl >= 0 ? "#22c55e" : "#ef4444", fontFamily: "monospace", fontSize: "14px", fontWeight: "700" }}>
            {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN")}
          </div>
        </div>
        <div>
          <div style={{ color: "#4a6580", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px" }}>WIN RATE</div>
          <div style={{ color: "#e8eaed", fontFamily: "monospace", fontSize: "14px", fontWeight: "700" }}>
            {winRate > 0 ? `${winRate}%` : "—"}
          </div>
        </div>

        {/* Rank change pill — only show if nonzero */}
        {change !== 0 && (
          <div style={{ background: isUp ? "#22c55e20" : "#ef444420", border: `1px solid ${isUp ? "#22c55e40" : "#ef444440"}`, borderRadius: "8px", padding: "6px 14px", color: isUp ? "#22c55e" : "#ef4444", fontFamily: "monospace", fontSize: "13px", fontWeight: "700" }}>
            {isUp ? "↑" : "↓"} {Math.abs(change)} spot{Math.abs(change) !== 1 ? "s" : ""} this week
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        style={{ background: "transparent", border: "1px solid #1e2d3d", borderRadius: "8px", padding: "8px 18px", color: "#4a6580", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0b429"; e.currentTarget.style.color = "#f0b429"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2d3d"; e.currentTarget.style.color = "#4a6580"; }}>
        VIEW MY STATS →
      </button>
    </div>
  );
};

export default MyRankBanner;