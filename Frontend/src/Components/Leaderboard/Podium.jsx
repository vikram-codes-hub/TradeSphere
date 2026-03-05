import React from 'react';

const badgeStyles = {
  APEX:   { bg: '#f0b429', color: '#000' },
  TITAN:  { bg: '#9ca3af', color: '#000' },
  ELITE:  { bg: '#a855f7', color: '#fff' },
  EXPERT: { bg: '#3b82f6', color: '#fff' },
  PRO:    { bg: '#14b8a6', color: '#fff' },
  TRADER: { bg: '#374151', color: '#9ca3af' },
};

const podiumOrder = [1, 0, 2]; // center is rank 1

const PodiumCard = ({ trader, isCenter }) => {
  const badge = badgeStyles[trader.badge] || badgeStyles.TRADER;
  const glowColor = trader.rank === 1 ? '#f0b429' : trader.rank === 2 ? '#9ca3af' : '#cd7c2f';
  const medalEmoji = trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : '🥉';

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f2236 0%, #0a1929 100%)',
      border: `1px solid ${isCenter ? glowColor + '60' : '#1e2d3d'}`,
      borderRadius: '16px',
      padding: '28px 24px',
      textAlign: 'center',
      flex: 1,
      maxWidth: isCenter ? '280px' : '240px',
      marginTop: isCenter ? '0' : '24px',
      boxShadow: isCenter ? `0 0 40px ${glowColor}20` : 'none',
      position: 'relative',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {isCenter && (
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          background: '#f0b429', color: '#000', fontSize: '10px', fontFamily: 'monospace',
          fontWeight: '800', letterSpacing: '2px', padding: '3px 12px', borderRadius: '999px',
        }}>
          #1 CHAMPION
        </div>
      )}

      {/* Avatar */}
      <div style={{
        width: isCenter ? '72px' : '60px',
        height: isCenter ? '72px' : '60px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${glowColor}40, ${glowColor}10)`,
        border: `2px solid ${glowColor}80`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
        fontSize: isCenter ? '22px' : '18px',
        color: glowColor,
        fontWeight: '800',
        fontFamily: 'monospace',
      }}>
        {trader.avatar}
      </div>

      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{medalEmoji}</div>
      <div style={{ color: '#e8eaed', fontFamily: '"Georgia", serif', fontSize: isCenter ? '18px' : '15px', fontWeight: 'bold', marginBottom: '6px' }}>
        {trader.name}
      </div>
      <div style={{ display: 'inline-block', background: badge.bg, color: badge.color, fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1.5px', padding: '2px 10px', borderRadius: '999px', marginBottom: '16px' }}>
        {trader.badge}
      </div>

      <div style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: isCenter ? '24px' : '20px', fontWeight: '800', marginBottom: '4px' }}>
        +₹{trader.totalPnL.toLocaleString('en-IN')}
      </div>

      <div className="flex justify-center gap-4 mt-3">
        <div>
          <div style={{ color: '#4a6580', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px' }}>WIN RATE</div>
          <div style={{ color: '#e8eaed', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700' }}>{trader.winRate}%</div>
        </div>
        <div style={{ width: '1px', background: '#1e2d3d' }}></div>
        <div>
          <div style={{ color: '#4a6580', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px' }}>STREAK</div>
          <div style={{ color: '#e8eaed', fontSize: '14px', fontFamily: 'monospace', fontWeight: '700' }}>
            {trader.streak > 0 ? `🔥 ${trader.streak}` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

const Podium = ({ data }) => {
  const top3 = data.slice(0, 3);
  const ordered = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div style={{ padding: '32px 8px 24px', borderBottom: '1px solid #1e2d3d' }}>
      <div style={{ color: '#4a6580', fontSize: '10px', letterSpacing: '3px', fontFamily: 'monospace', textAlign: 'center', marginBottom: '24px' }}>
        ▲ TOP PERFORMERS
      </div>
      <div className="flex justify-center items-end gap-4">
        {ordered.map((trader) => (
          <PodiumCard key={trader.rank} trader={trader} isCenter={trader.rank === 1} />
        ))}
      </div>
    </div>
  );
};

export default Podium;