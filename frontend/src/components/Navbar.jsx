import React from 'react';

export default function Navbar({ activeTab, onSelectTab }) {
  return (
    <header className="header-booking">
      <div className="container">
        <div className="header-top-row">
          {/* Logo */}
          <div className="brand-logo-area" onClick={() => onSelectTab('stays')} style={{ cursor: 'pointer' }}>
            <span className="brand-logo-main">Booking.com</span>
            <span className="brand-logo-sub">Smart Holiday</span>
          </div>

          {/* Right Header Utilities */}
          <div className="header-actions">
            <div className="currency-pill">
              <span>INR</span>
              <span style={{ fontSize: '16px' }}>🇮🇳</span>
            </div>
            <button 
              className={`btn-header-outline ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => onSelectTab('bookings')}
            >
              My Reservations
            </button>
            <button 
              className="btn-header-white"
              onClick={() => onSelectTab('bookings')}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* 5 Authentic Non-Overflowing Navigation Tabs */}
        <nav className="header-nav-tabs">
          <button 
            className={`tab-item-btn ${activeTab === 'stays' ? 'active' : ''}`}
            onClick={() => onSelectTab('stays')}
          >
            🛏️ Stays
          </button>
          <button 
            className={`tab-item-btn ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => onSelectTab('flights')}
          >
            ✈️ Flights
          </button>
          <button 
            className={`tab-item-btn ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => onSelectTab('packages')}
          >
            🏨 Flight + Hotel
          </button>
          <button 
            className={`tab-item-btn ${activeTab === 'attractions' ? 'active' : ''}`}
            onClick={() => onSelectTab('attractions')}
          >
            🎡 Attractions
          </button>
          <button 
            className={`tab-item-btn badge-special ${activeTab === 'spiritual' ? 'active' : ''}`}
            onClick={() => onSelectTab('spiritual')}
          >
            ⛩️ Tirth Yatra
          </button>
        </nav>
      </div>
    </header>
  );
}

