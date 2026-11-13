import React from 'react';
import SearchFrame from './SearchFrame';

export default function StaysView({
  searchParams,
  setSearchParams,
  onSearch,
  onOpenGuestModal,
  onApplyPreset,
  onNavigate,
}) {
  return (
    <div className="container" style={{ paddingTop: '28px' }}>
      {/* Page Title & Intro */}
      <div style={{ marginBottom: '22px' }}>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#C28B51',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
          }}
        >
          ✨ SMART HOLIDAY ARCHITECTURE
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-dark)',
            margin: '6px 0 4px 0',
            letterSpacing: '-0.5px',
          }}
        >
          Build Your Curated Holiday
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', maxWidth: '680px' }}>
          Verified flights, certified family suites, private chauffeur transfers & curated passes — auto-optimized to your budget.
        </p>
      </div>

      {/* Signature Search Frame */}
      <SearchFrame
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onSearch={onSearch}
        onOpenGuestModal={onOpenGuestModal}
        onApplyPreset={onApplyPreset}
      />

      {/* Explore Trending Destinations */}
      <div style={{ marginTop: '36px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#C28B51', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ✨ Curated Itineraries
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--text-dark)', margin: '0 0 6px 0' }}>
          Explore Trending Destinations
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
          One-click validated holiday packages with flights, certified stays, and transfers auto-configured to your budget.
        </p>

        <div className="explore-country-grid">
          {/* Card 1: Japan */}
          <div
            className="country-thumb-card"
            onClick={() =>
              onApplyPreset('Bengaluru', 'Japan', '2027-04-10', 6, 2, 1, [6], 350000)
            }
          >
            <img src="/images/attractions/att_tokyo_sensoji.jpg" alt="Japan" />
            <div className="country-overlay">
              <span className="country-flag-badge">🇯🇵 Japan Golden Route</span>
              <p className="country-desc">Tokyo, Kyoto & Osaka · 6 Nights · Packages from ₹1,64,472</p>
            </div>
          </div>

          {/* Card 2: UAE */}
          <div
            className="country-thumb-card"
            onClick={() =>
              onApplyPreset('Delhi', 'United Arab Emirates', '2027-04-05', 4, 2, 0, [], 250000)
            }
          >
            <img src="/images/attractions/att_auh_sheikh_zayed_mosque.jpg" alt="UAE" />
            <div className="country-overlay">
              <span className="country-flag-badge">🇦🇪 United Arab Emirates</span>
              <p className="country-desc">Dubai & Abu Dhabi · 4 Nights · Packages from ₹1,29,227</p>
            </div>
          </div>

          {/* Card 3: Sacred India Pilgrimage */}
          <div className="country-thumb-card" onClick={() => onNavigate('spiritual')}>
            <img src="/images/attractions/att_kyo_kinkakuji.jpg" alt="Sacred Pilgrimage" />
            <div className="country-overlay">
              <span className="country-flag-badge">⛩️ Sacred India Pilgrimage</span>
              <p className="country-desc">Char Dham, Kashi & Tirupati · Curated for Parents · View Yatras →</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

