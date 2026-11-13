import React, { useState, useEffect } from 'react';
import { fetchFlights } from '../api';

export default function FlightsView({ onSelectFlightForPackage, showToast }) {
  const [fromAirport, setFromAirport] = useState('BLR');
  const [toAirport, setToAirport] = useState('HND');
  const [cabinClass, setCabinClass] = useState('economy');
  const [directOnly, setDirectOnly] = useState(true);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    executeSearch();
  }, [fromAirport, toAirport, cabinClass]);

  async function executeSearch() {
    setLoading(true);
    try {
      const data = await fetchFlights({
        from: fromAirport,
        to: toAirport,
        cabin: cabinClass
      });
      if (data.success && data.flights) {
        setFlights(data.flights);
      }
    } catch (err) {
      console.error('Flight search error:', err);
    } finally {
      setLoading(false);
    }
  }

  function getAirlineBadge(airline) {
    if (airline.includes('Nippon')) return { code: 'NS', cls: 'logo-ns' };
    if (airline.includes('AirVeda')) return { code: 'AV', cls: 'logo-av' };
    return { code: 'SA', cls: 'logo-sa' };
  }

  return (
    <div>
      {/* Flights Blue Hero */}
      <section className="flights-hero-section">
        <div className="container">
          <h1 className="hero-title-main" style={{ fontSize: '32px' }}>
            Compare and book cheap flights with ease
          </h1>
          <p className="hero-subtitle-main">
            Discover real scheduled flights between India hubs and Japan/UAE destinations
          </p>

          {/* Flights Search Box */}
          <div className="flights-search-container">
            <div className="flight-options-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="tripType" defaultChecked /> Round trip
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="tripType" /> One way
              </label>
              <select 
                style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '13px' }}
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={directOnly}
                  onChange={(e) => setDirectOnly(e.target.checked)}
                /> Direct flights only
              </label>
            </div>

            <div className="flights-inputs-grid">
              <div className="search-cell">
                <span className="search-cell-icon">🛫</span>
                <div className="search-cell-content">
                  <span className="search-cell-label">Leaving from</span>
                  <select 
                    className="search-cell-select"
                    value={fromAirport}
                    onChange={(e) => setFromAirport(e.target.value)}
                  >
                    <option value="BLR">BLR - Kempegowda Intl, Bengaluru</option>
                    <option value="DEL">DEL - Indira Gandhi Intl, Delhi</option>
                    <option value="BOM">BOM - Chhatrapati Shivaji, Mumbai</option>
                    <option value="MAA">MAA - Chennai International</option>
                  </select>
                </div>
              </div>

              <div className="search-cell">
                <span className="search-cell-icon">🛬</span>
                <div className="search-cell-content">
                  <span className="search-cell-label">Going to</span>
                  <select 
                    className="search-cell-select"
                    value={toAirport}
                    onChange={(e) => setToAirport(e.target.value)}
                  >
                    <option value="HND">HND - Tokyo Haneda, Japan</option>
                    <option value="NRT">NRT - Tokyo Narita, Japan</option>
                    <option value="DXB">DXB - Dubai International, UAE</option>
                    <option value="AUH">AUH - Zayed Intl, Abu Dhabi</option>
                  </select>
                </div>
              </div>

              <div className="search-cell">
                <span className="search-cell-icon">📅</span>
                <div className="search-cell-content">
                  <span className="search-cell-label">Travel dates</span>
                  <input type="text" className="search-cell-input" value="Sat 10 Apr - Fri 16 Apr 2027" readOnly />
                </div>
              </div>

              <button className="btn-search-booking" onClick={executeSearch}>
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Results List */}
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ fontSize: '20px', margin: 0 }}>
            Available Flights ({flights.length})
          </h2>
          <span className="booking-pill pill-blue">Verified April 2027 Schedule</span>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Fetching flights from catalog...</div>
        ) : (
          <div>
            {flights.map(fl => {
              const badge = getAirlineBadge(fl.airline);
              const priceOneSeat = fl.price_per_seat ? fl.price_per_seat.amount : 32200;
              const priceTotal = priceOneSeat * 3;
              const stopsText = fl.stops === 0 ? 'Non-stop' : `${fl.stops} stop`;

              return (
                <div key={fl.flight_id} className="flight-card-booking">
                  <div className="airline-brand-box">
                    <div className={`airline-badge-logo ${badge.cls}`}>{badge.code}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{fl.airline}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fl.flight_number} · {fl.aircraft || 'B787 Dreamliner'}</div>
                    </div>
                  </div>

                  <div className="flight-route-strip">
                    <div className="time-city-block">
                      <span className="flight-time-large">{fl.departure_time || '08:45'}</span>
                      <span className="flight-city-sub">{fl.from_airport || fromAirport}</span>
                    </div>

                    <div className="trajectory-center-bar">
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {fl.duration_formatted || `${Math.floor(fl.duration_minutes / 60)}h ${fl.duration_minutes % 60}m`}
                      </span>
                      <div className="trajectory-line-dashed">
                        <span className="trajectory-airplane-glyph">✈</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>{stopsText}</span>
                    </div>

                    <div className="time-city-block" style={{ textAlign: 'right' }}>
                      <span className="flight-time-large">{fl.arrival_time || '18:15'}</span>
                      <span className="flight-city-sub">{fl.to_airport || toAirport}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', paddingRight: '14px', borderRight: '1px solid var(--border-gray)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total for 3 travelers</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-dark)' }}>
                      ₹{priceTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Includes taxes & baggage</div>
                  </div>

                  <div>
                    <button 
                      className="btn-booking-primary"
                      onClick={() => {
                        onSelectFlightForPackage(fl);
                        showToast(`Selected ${fl.airline} (${fl.flight_number})! Injected into package.`);
                      }}
                    >
                      Select Flight
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

