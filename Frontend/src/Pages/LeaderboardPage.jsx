import React, { useState, useEffect } from 'react';
import Hero from '../Components/Leaderboard/Hero';
import Podium from '../Components/Leaderboard/Podium';
import LeaderboardTable from '../Components/Leaderboard/LeaderboardTable';
import MyRankBanner from '../Components/Leaderboard/MyRankBanner';

const mockLeaderboard = [
  { rank: 1,  name: "Arjun Mehta",  avatar: "AM", totalPnL: 284750, winRate: 91.2, trades: 342, streak: 14, badge: "APEX",   change: 0  },
  { rank: 2,  name: "Priya Sharma", avatar: "PS", totalPnL: 231400, winRate: 87.6, trades: 289, streak: 9,  badge: "TITAN",  change: 1  },
  { rank: 3,  name: "Rohan Das",    avatar: "RD", totalPnL: 198200, winRate: 82.1, trades: 401, streak: 6,  badge: "ELITE",  change: -1 },
  { rank: 4,  name: "Neha Kapoor",  avatar: "NK", totalPnL: 156800, winRate: 79.4, trades: 215, streak: 4,  badge: "EXPERT", change: 2  },
  { rank: 5,  name: "Vikram Bose",  avatar: "VB", totalPnL: 142300, winRate: 76.8, trades: 178, streak: 7,  badge: "EXPERT", change: 0  },
  { rank: 6,  name: "Anjali Nair",  avatar: "AN", totalPnL: 118900, winRate: 74.2, trades: 263, streak: 3,  badge: "PRO",    change: -2 },
  { rank: 7,  name: "Kabir Singh",  avatar: "KS", totalPnL: 97400,  winRate: 71.5, trades: 192, streak: 5,  badge: "PRO",    change: 1  },
  { rank: 8,  name: "Divya Reddy",  avatar: "DR", totalPnL: 84600,  winRate: 68.9, trades: 147, streak: 2,  badge: "PRO",    change: 3  },
  { rank: 9,  name: "Siddharth P.", avatar: "SP", totalPnL: 71200,  winRate: 65.3, trades: 203, streak: 1,  badge: "TRADER", change: -1 },
  { rank: 10, name: "Meera Joshi",  avatar: "MJ", totalPnL: 59800,  winRate: 62.7, trades: 131, streak: 0,  badge: "TRADER", change: 0  },
];

const weeklyData = [
  { rank: 1, name: "Divya Reddy",  avatar: "DR", totalPnL: 42800, winRate: 88.4, trades: 47, streak: 5,  badge: "ELITE",  change: 7 },
  { rank: 2, name: "Kabir Singh",  avatar: "KS", totalPnL: 38200, winRate: 84.1, trades: 39, streak: 4,  badge: "EXPERT", change: 4 },
  { rank: 3, name: "Arjun Mehta",  avatar: "AM", totalPnL: 31500, winRate: 90.2, trades: 51, streak: 14, badge: "APEX",   change: 0 },
  { rank: 4, name: "Neha Kapoor",  avatar: "NK", totalPnL: 27900, winRate: 81.3, trades: 32, streak: 4,  badge: "EXPERT", change: 0 },
  { rank: 5, name: "Meera Joshi",  avatar: "MJ", totalPnL: 24100, winRate: 77.6, trades: 28, streak: 3,  badge: "TRADER", change: 5 },
];

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('All Time');
  const [lastUpdated, setLastUpdated] = useState(0);

  const data = activeTab === 'All Time' ? mockLeaderboard : weeklyData;

  useEffect(() => {
    setLastUpdated(0);
    const interval = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060d14',
      display: 'flex',
      flexDirection: 'column',
      marginTop:'15px'
    }} >
      {/* Subtle grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(#1e2d3d18 1px, transparent 1px),
          linear-gradient(90deg, #1e2d3d18 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <Hero
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            lastUpdated={lastUpdated}
          />

          <Podium data={data} />

          <LeaderboardTable data={data} />

        </div>
      </div>

      <MyRankBanner />
    </div>
  );
};

export default LeaderboardPage;