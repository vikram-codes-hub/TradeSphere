import React from 'react';

const Hero = ({ activeTab, setActiveTab, lastUpdated }) => {
  return (
    <div style={{ borderBottom: '1px solid #1e2d3d' }} className="px-8 pt-8 pb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span style={{ color: '#f0b429', fontSize: '11px', letterSpacing: '4px', fontFamily: 'monospace' }} className="font-bold">TRADESPHERE</span>
          </div>
          <h1 style={{ fontFamily: '"Georgia", serif', fontSize: '42px', color: '#e8eaed', letterSpacing: '-1px', lineHeight: 1 }} className="font-bold">
            Leaderboard
          </h1>
          <p style={{ color: '#4a6580', fontSize: '13px', fontFamily: 'monospace' }} className="mt-1">
            Ranked by total realized P&L
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
            <span style={{ color: '#4a6580', fontSize: '12px', fontFamily: 'monospace' }}>
              Updated {lastUpdated}s ago
            </span>
          </div>
          <div style={{ background: '#0d1b2a', border: '1px solid #1e2d3d', borderRadius: '999px', padding: '3px' }} className="flex">
            {['All Time', 'This Week'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 20px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === tab ? '#f0b429' : 'transparent',
                  color: activeTab === tab ? '#000' : '#4a6580',
                  border: 'none',
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'TOTAL TRADES', value: '48,204', icon: '⚡' },
          { label: 'VIRTUAL P&L GENERATED', value: '₹9.2 Cr', icon: '💰' },
          { label: 'ACTIVE TRADERS', value: '1,847', icon: '👥' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#0d1b2a', border: '1px solid #1e2d3d', borderRadius: '10px', padding: '14px 18px' }}>
            <div style={{ color: '#4a6580', fontSize: '10px', letterSpacing: '2px', fontFamily: 'monospace' }} className="mb-1">{stat.icon} {stat.label}</div>
            <div style={{ color: '#e8eaed', fontSize: '22px', fontFamily: '"Georgia", serif', fontWeight: 'bold' }}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;