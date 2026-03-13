import { useState, useEffect, useCallback } from "react";
import { leaderboardService } from "../services/leaderboardService";
import Hero             from "../Components/Leaderboard/Hero";
import Podium           from "../Components/Leaderboard/Podium";
import LeaderboardTable from "../Components/Leaderboard/LeaderboardTable";
import MyRankBanner     from "../Components/Leaderboard/MyRankBanner";

// Badge assignment based on P&L rank
const assignBadge = (rank) => {
  if (rank === 1)  return "APEX";
  if (rank === 2)  return "TITAN";
  if (rank <= 5)   return "ELITE";
  if (rank <= 10)  return "EXPERT";
  if (rank <= 25)  return "PRO";
  return "TRADER";
};

// Normalise a leaderboard entry from API to component shape
const normalise = (entry, index) => {
  const rank     = entry.rank      ?? index + 1;
  const name     = entry.username  ?? entry.name      ?? entry.user?.username ?? "Trader";
  const avatar   = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const totalPnL = entry.totalPnl  ?? entry.totalPnL  ?? entry.pnl ?? 0;
  const winRate  = entry.winRate   ?? entry.win_rate  ?? 0;
  const trades   = entry.totalTrades ?? entry.trades  ?? 0;
  const streak   = entry.streak    ?? entry.winStreak ?? 0;
  const change   = entry.rankChange ?? entry.change   ?? 0;
  const badge    = entry.badge     ?? assignBadge(rank);
  return { rank, name, avatar, totalPnL, winRate, trades, streak, change, badge, _id: entry._id ?? entry.userId };
};

const TAB_PERIOD = { "All Time": "all", "This Week": "weekly" };

const LeaderboardPage = () => {
  const [activeTab,    setActiveTab]    = useState("All Time");
  const [data,         setData]         = useState([]);
  const [myRank,       setMyRank]       = useState(null);
  const [globalStats,  setGlobalStats]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(0);

  // ── Fetch leaderboard ─────────────────────────────────
  const fetchLeaderboard = useCallback(async (tab) => {
    setLoading(true);
    try {
      const period = TAB_PERIOD[tab] ?? "all";
      const [lbRes, rankRes] = await Promise.all([
        leaderboardService.getLeaderboard({ period, limit: 20 }),
        leaderboardService.getMyRank({ period }).catch(() => null),
      ]);

      // Normalise entries
      const entries = (lbRes?.leaderboard ?? lbRes?.data ?? lbRes?.traders ?? [])
        .map((e, i) => normalise(e, i));
      setData(entries);

      // Global stats — from response or derived
      setGlobalStats(lbRes?.stats ?? lbRes?.globalStats ?? null);

      // My rank
      if (rankRes) {
        const me = rankRes?.myRank ?? rankRes?.rank ?? rankRes;
        setMyRank(normalise(me, 999));
      }

      setLastUpdated(0);
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(activeTab); }, [activeTab, fetchLeaderboard]);

  // ── Live "updated X seconds ago" counter ─────────────
  useEffect(() => {
    const iv = setInterval(() => setLastUpdated(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [activeTab]);

  return (
    <div style={{ minHeight: "100vh", background: "#060d14", display: "flex", flexDirection: "column", marginTop: "15px" }}>
      {/* Grid bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(#1e2d3d18 1px, transparent 1px), linear-gradient(90deg, #1e2d3d18 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div style={{ position: "relative", zIndex: 1, flex: 1, overflowY: "auto", paddingBottom: "72px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <Hero
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            lastUpdated={lastUpdated}
            globalStats={globalStats}
            loading={loading}
          />

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: "36px", height: "36px", border: "3px solid #1e2d3d", borderTop: "3px solid #f0b429", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <div style={{ color: "#4a6580", fontFamily: "monospace", fontSize: "13px" }}>Loading rankings...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : data.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#4a6580", fontFamily: "monospace", fontSize: "14px" }}>
              No leaderboard data yet. Start trading to appear here!
            </div>
          ) : (
            <>
              <Podium data={data} />
              <LeaderboardTable data={data} />
            </>
          )}

        </div>
      </div>

      <MyRankBanner myRank={myRank} />
    </div>
  );
};

export default LeaderboardPage;