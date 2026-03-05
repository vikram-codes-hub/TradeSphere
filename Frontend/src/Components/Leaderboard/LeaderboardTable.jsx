import React from 'react';

const badgeStyles = {
  APEX:   { bg: '#f0b42920', color: '#f0b429', border: '#f0b42940' },
  TITAN:  { bg: '#9ca3af20', color: '#9ca3af', border: '#9ca3af40' },
  ELITE:  { bg: '#a855f720', color: '#a855f7', border: '#a855f740' },
  EXPERT: { bg: '#3b82f620', color: '#3b82f6', border: '#3b82f640' },
  PRO:    { bg: '#14b8a620', color: '#14b8a6', border: '#14b8a640' },
  TRADER: { bg: '#37415120', color: '#6b7280', border: '#37415140' },
};

const RankChange = ({ change }) => {
  if (change === 0) return <span style={{ color: '#374151', fontFamily: 'monospace', fontSize: '11px' }}>—</span>;
  if (change > 0) return <span style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '11px', fontWeight: '700' }}>▲{change}</span>;
  return <span style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: '11px', fontWeight: '700' }}>▼{Math.abs(change)}</span>;
};

const WinRateBar = ({ rate }) => (
  <div className="flex items-center gap-2">
    <div style={{ flex: 1, height: '4px', background: '#0d1b2a', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${rate}%`,
        background: rate > 80 ? '#22c55e' : rate > 65 ? '#f0b429' : '#ef4444',
        borderRadius: '999px',
        transition: 'width 0.6s ease',
      }} />
    </div>
    <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '12px', minWidth: '38px' }}>{rate}%</span>
  </div>
);

const TableRow = ({ trader, index }) => {
  const badge = badgeStyles[trader.badge] || badgeStyles.TRADER;
  const [hovered, setHovered] = React.useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderLeft: hovered ? '3px solid #f0b429' : '3px solid transparent',
        background: hovered ? '#0f2236' : index % 2 === 0 ? '#080f18' : '#060d14',
        transition: 'all 0.15s',
        cursor: 'default',
      }}
    >
      {/* Rank */}
      <td style={{ padding: '14px 16px', width: '60px' }}>
        <span style={{ color: '#4a6580', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600' }}>
          #{trader.rank}
        </span>
      </td>

      {/* Change */}
      <td style={{ padding: '14px 8px', width: '50px', textAlign: 'center' }}>
        <RankChange change={trader.change} />
      </td>

      {/* Trader */}
      <td style={{ padding: '14px 16px' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: '#0d1b2a', border: '1px solid #1e2d3d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontFamily: 'monospace', fontWeight: '800', color: '#9ca3af',
          }}>
            {trader.avatar}
          </div>
          <span style={{ color: '#e8eaed', fontFamily: '"Georgia", serif', fontSize: '14px' }}>{trader.name}</span>
        </div>
      </td>

      {/* Badge */}
      <td style={{ padding: '14px 16px' }}>
        <span style={{
          background: badge.bg, color: badge.color,
          border: `1px solid ${badge.border}`,
          fontSize: '10px', fontFamily: 'monospace', fontWeight: '700',
          letterSpacing: '1.5px', padding: '3px 10px', borderRadius: '999px',
        }}>
          {trader.badge}
        </span>
      </td>

      {/* P&L */}
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <span style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>
          +₹{trader.totalPnL.toLocaleString('en-IN')}
        </span>
      </td>

      {/* Win Rate */}
      <td style={{ padding: '14px 24px 14px 16px', minWidth: '140px' }}>
        <WinRateBar rate={trader.winRate} />
      </td>

      {/* Trades */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '13px' }}>{trader.trades}</span>
      </td>

      {/* Streak */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: trader.streak > 0 ? '#f97316' : '#374151' }}>
          {trader.streak > 0 ? `🔥 ${trader.streak}` : '—'}
        </span>
      </td>
    </tr>
  );
};

const LeaderboardTable = ({ data }) => {
  const tableData = data.slice(3);

  if (tableData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#4a6580', fontFamily: 'monospace' }}>
        No additional traders to display.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ color: '#4a6580', fontSize: '10px', letterSpacing: '3px', fontFamily: 'monospace', marginBottom: '16px' }}>
        ◆ FULL RANKINGS
      </div>
      <div style={{ border: '1px solid #1e2d3d', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0a1929', borderBottom: '1px solid #1e2d3d' }}>
              {['RANK', '±', 'TRADER', 'BADGE', 'TOTAL P&L', 'WIN RATE', 'TRADES', 'STREAK'].map((col) => (
                <th key={col} style={{
                  padding: '10px 16px',
                  color: '#4a6580', fontFamily: 'monospace',
                  fontSize: '10px', letterSpacing: '1.5px',
                  fontWeight: '600', textAlign: col === 'TOTAL P&L' ? 'right' : col === 'TRADES' || col === 'STREAK' || col === '±' ? 'center' : 'left',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((trader, i) => (
              <TableRow key={trader.rank} trader={trader} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;