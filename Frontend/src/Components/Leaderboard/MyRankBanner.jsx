import React from 'react';

const MyRankBanner = () => {
  const myStats = {
    rank: 234,
    pnl: 18400,
    winRate: 61.2,
    weekChange: 12,
  };

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(90deg, #0a1929 0%, #0f2236 50%, #0a1929 100%)',
      borderTop: '1px solid #f0b42940',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      <div className="flex items-center gap-3">
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: '#0d1b2a', border: '1px solid #f0b42940',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontFamily: 'monospace', fontWeight: '800', color: '#f0b429',
        }}>
          YO
        </div>
        <div>
          <div style={{ color: '#4a6580', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1.5px' }}>YOUR POSITION</div>
          <div style={{ color: '#e8eaed', fontFamily: '"Georgia", serif', fontSize: '15px', fontWeight: 'bold' }}>
            Rank #{myStats.rank}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div>
          <div style={{ color: '#4a6580', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px' }}>P&L</div>
          <div style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>
            +₹{myStats.pnl.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <div style={{ color: '#4a6580', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px' }}>WIN RATE</div>
          <div style={{ color: '#e8eaed', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>{myStats.winRate}%</div>
        </div>
        <div style={{
          background: '#22c55e20', border: '1px solid #22c55e40',
          borderRadius: '8px', padding: '6px 14px',
          color: '#22c55e', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700',
        }}>
          ↑ {myStats.weekChange} spots this week
        </div>
      </div>

      <button style={{
        background: 'transparent', border: '1px solid #1e2d3d',
        borderRadius: '8px', padding: '8px 18px',
        color: '#4a6580', fontFamily: 'monospace', fontSize: '11px',
        letterSpacing: '1px', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.target.style.borderColor = '#f0b429'; e.target.style.color = '#f0b429'; }}
      onMouseLeave={e => { e.target.style.borderColor = '#1e2d3d'; e.target.style.color = '#4a6580'; }}
      >
        VIEW MY STATS →
      </button>
    </div>
  );
};

export default MyRankBanner;