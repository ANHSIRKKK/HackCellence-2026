import React from 'react';

export default function Navigation({ activeTab, onNavigate }) {
  const tabs = [
    { id: 'stays', label: 'Stays', icon: '🛏️' },
    { id: 'flights', label: 'Flights', icon: '✈️' },
    { id: 'package', label: 'Flight + Hotel', icon: '🏨' },
    { id: 'attractions', label: 'Attractions', icon: '🎡' },
    { id: 'spiritual', label: 'Sacred Tirth Yatra', icon: '⛩️' },
  ];

  return (
    <div className="container" style={{ marginTop: '16px', marginBottom: '8px' }}>
      <nav className="header-nav-pills" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onNavigate(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

