import React from 'react';

export default function Header({ activeTab, onNavigate }) {
  return (
    <div className="header-dynamic-island-wrapper">
      <header className="header-booking">
        <div className="header-top-row">
          {/* Logo Area */}
          <div className="brand-logo-area" onClick={() => onNavigate('stays')}>
            <span className="brand-logo-main">TRIPRISE</span>
            <span className="brand-logo-sub">LUXURY HOLIDAYS</span>
          </div>

          {/* Right Header Actions */}
          <div className="header-actions">
            <button 
              className={`btn-header-yatra ${activeTab === 'spiritual' ? 'active' : ''}`}
              onClick={() => onNavigate('spiritual')}
            >
              ⛩️ Tirth Yatra
            </button>
            <div className="currency-pill">
              <span>INR</span>
              <span style={{ fontSize: '14px' }}>🇮🇳</span>
            </div>
            <button 
              className={`btn-header-white ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => onNavigate('bookings')}
            >
              My Reservations
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

