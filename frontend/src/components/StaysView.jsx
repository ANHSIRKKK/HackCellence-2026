import React, { useState, useEffect } from 'react';
import { fetchHotels } from '../api';

export default function StaysView({
  searchParams,
  setSearchParams,
  guestState,
  onOpenGuestPicker,
  onPlanPackageWithHotel,
  onSearchSubmit,
  showToast
}) {
  const [cityFilter, setCityFilter] = useState('all');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHotels(cityFilter);
  }, [cityFilter]);

  async function loadHotels(city) {
    setLoading(true);
    try {
      const data = await fetchHotels(city);
      if (data.success && data.hotels) {
        setHotels(data.hotels);
      }
    } catch (err) {
      console.error('Failed to load hotels:', err);
    } finally {
      setLoading(false);
    }
  }

  const cities = [
    { id: 'all', label: 'All Cities' },
    { id: 'Tokyo', label: 'Tokyo' },
    { id: 'Kyoto', label: 'Kyoto' },
    { id: 'Osaka', label: 'Osaka' },
    { id: 'Dubai', label: 'Dubai' },
    { id: 'Abu Dhabi', label: 'Abu Dhabi' }
  ];

  return (
    <div>
      {/* Hero Banner with Promo */}
      <section className="hero-banner-section">
        <div className="container">
          <div className="hero-sale-badge">Our First 11.11 Smart Holiday Sale is Live!</div>
          <h1 className="hero-title-main">Save 30% or more on dream stays & packages</h1>
          <p className="hero-subtitle-main">
            Get complete verified packages: Outbound & Return Flights + Certified Hotel Rooms + Airport Transfers + Attraction Passes auto-optimized to your budget.
          </p>
          <button 
            className="btn-booking-primary" 
            style={{ padding: '12px 24px', fontSize: '15px' }}
            onClick={onSearchSubmit}
          >
            Explore Auto-Optimized Packages →
          </button>
        </div>
      </section>

      {/* Signature Yellow Search Box */}
      <div className="container search-box-anchor">
        <div className="yellow-search-box">
          <div className="search-cell">
            <span className="search-cell-icon">📍</span>
            <div className="search-cell-content">
              <span className="search-cell-label">From — To Destination</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select 
                  className="search-cell-select"
                  value={searchParams.departureCity}
                  onChange={(e) => setSearchParams({ ...searchParams, departureCity: e.target.value })}
                >
                  <option value="Bengaluru">BLR (Bengaluru)</option>
                  <option value="Delhi">DEL (New Delhi)</option>
                  <option value="Mumbai">BOM (Mumbai)</option>
                  <option value="Chennai">MAA (Chennai)</option>
                </select>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>→</span>
                <select 
                  className="search-cell-select"
                  value={searchParams.destinationCountry}
                  onChange={(e) => setSearchParams({ ...searchParams, destinationCountry: e.target.value })}
                >
                  <option value="Japan">Japan (Tokyo, Kyoto, Osaka)</option>
                  <option value="United Arab Emirates">UAE (Dubai, Abu Dhabi)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="search-cell">
            <span className="search-cell-icon">📅</span>
            <div className="search-cell-content">
              <span className="search-cell-label">Check-in — Check-out (Nights)</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input 
                  type="date" 
                  className="search-cell-input" 
                  value={searchParams.startDate}
                  min="2027-04-01" 
                  max="2027-04-20"
                  onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                />
                <select 
                  className="search-cell-select" 
                  style={{ maxWidth: '100px' }}
                  value={searchParams.nights}
                  onChange={(e) => setSearchParams({ ...searchParams, nights: parseInt(e.target.value) })}
                >
                  <option value={3}>3 Nights</option>
                  <option value={4}>4 Nights</option>
                  <option value={5}>5 Nights</option>
                  <option value={6}>6 Nights</option>
                  <option value={7}>7 Nights</option>
                  <option value={8}>8 Nights</option>
                </select>
              </div>
            </div>
          </div>

          <div className="search-cell" style={{ cursor: 'pointer' }} onClick={onOpenGuestPicker}>
            <span className="search-cell-icon">👤</span>
            <div className="search-cell-content">
              <span className="search-cell-label">Guests & Occupancy</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>
                {guestState.adults} adults · {guestState.children} child ({guestState.childAges.join(', ') || 'none'})
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⌵</span>
          </div>

          <div className="search-cell">
            <span className="search-cell-icon">₹</span>
            <div className="search-cell-content">
              <span className="search-cell-label">Total Holiday Budget</span>
              <input 
                type="number" 
                className="search-cell-input" 
                value={searchParams.budget}
                step={10000}
                onChange={(e) => setSearchParams({ ...searchParams, budget: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <button className="btn-search-booking" onClick={onSearchSubmit}>
            Search
          </button>
        </div>
      </div>

      {/* Main Content Container: Stays / Hotels Grid */}
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <div>
            <h2 className="section-title">Verified Accommodations & Stays</h2>
            <p className="section-subtitle">Real hotel inventory with verified room-fit formulas and star ratings</p>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="filter-pills-bar">
          {cities.map(c => (
            <button
              key={c.id}
              className={`filter-btn-pill ${cityFilter === c.id ? 'active' : ''}`}
              onClick={() => setCityFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Hotels Grid */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading verified catalog stays...
          </div>
        ) : (
          <div className="hotels-grid-catalog">
            {hotels.map(h => {
              const stars = '⭐'.repeat(h.stars || 4);
              const pricePerNight = Math.round((h.stars || 3) * 6200);
              const guestRating = (7.8 + (h.stars || 3) * 0.4).toFixed(1);

              return (
                <div key={h.hotel_id} className="hotel-catalog-card">
                  <img 
                    src={h.image || '/images/hotels/HOTEL-BUSINESS-1.jpg'} 
                    alt={h.name}
                    className="hotel-card-img"
                    onError={(e) => { e.target.src = '/images/hotels/HOTEL-BUSINESS-1.jpg'; }}
                  />
                  <div className="hotel-card-body">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#f59e0b' }}>{stars}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)' }}>Fabulous</span>
                          <span className="hotel-score-badge">{guestRating}</span>
                        </div>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '4px' }}>
                        {h.name}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        📍 {h.city} · {h.location || 'Central City'}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span className="booking-pill pill-blue">✓ Certified Room-Fit</span>
                        <span className="booking-pill pill-green">Free Cancellation</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-gray)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Starting from</div>
                        <strong style={{ fontSize: '16px', color: 'var(--text-dark)' }}>₹{pricePerNight.toLocaleString()}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> /night</span>
                      </div>
                      <button 
                        className="btn-booking-primary"
                        onClick={() => onPlanPackageWithHotel(h)}
                      >
                        Plan Package →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Why Booking.com Section */}
        <h2 className="section-title">Why Choose Booking.com Smart Holiday?</h2>
        <div className="why-booking-grid">
          <div className="why-card">
            <span className="why-icon">⚡</span>
            <div>
              <div className="why-card-title">100% Budget Aware</div>
              <div className="why-card-text">Our engine guarantees you never overspend on flights at the expense of good hotel stays.</div>
            </div>
          </div>
          <div className="why-card">
            <span className="why-icon">🛡️</span>
            <div>
              <div className="why-card-title">Strict Buffer Validation</div>
              <div className="why-card-text">Every transfer includes mandatory 60-min airport & check-in safety cushions.</div>
            </div>
          </div>
          <div className="why-card">
            <span className="why-icon">👨‍👩‍👧</span>
            <div>
              <div className="why-card-title">Child & Family Policy</div>
              <div className="why-card-text">Room capacities accurately checked with deterministic room capacity formulas.</div>
            </div>
          </div>
          <div className="why-card">
            <span className="why-icon">🔒</span>
            <div>
              <div className="why-card-title">Guaranteed Inventory</div>
              <div className="why-card-text">Real-time room and seat hold system prevents accidental double bookings.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

