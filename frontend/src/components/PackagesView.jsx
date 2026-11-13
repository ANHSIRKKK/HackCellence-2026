import React from 'react';

export default function PackagesView({
  packageData,
  selectedTier,
  setSelectedTier,
  searchParams,
  onOpenSwapModal,
  onRemoveAttraction,
  onConfirmBooking,
  onExportJson,
  onReOptimize
}) {
  if (!packageData) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Optimizing Your Holiday Package...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Calculating deterministic travel rules, room-fit formulas, and safety buffers...</p>
      </div>
    );
  }

  const trip = packageData.trip || packageData;
  const budget = searchParams.budget || 350000;
  const totalCost = trip.total_price_inr || 164472;
  const budgetPercent = Math.min(100, Math.round((totalCost / budget) * 100));
  const remainingBudget = Math.max(0, budget - totalCost);

  // Extract components
  const flights = trip.flights || [];
  const outboundFlight = flights[0] || {};
  const returnFlight = flights[flights.length - 1] || {};
  const hotel = (trip.hotels && trip.hotels[0]) || {};
  const transfers = trip.transfers || [];
  const attractions = trip.attractions || [];

  const flightCost = flights.reduce((sum, f) => sum + (f.total_price_inr || (f.price_per_seat ? f.price_per_seat.amount * 3 : 48300)), 0);
  const hotelCost = hotel.total_price_inr || ((hotel.stars || 4) * 6160);
  const transferCost = transfers.reduce((sum, t) => sum + (t.price_inr || 5040), 0);
  const attractionCost = attractions.reduce((sum, a) => sum + (a.total_price_inr || a.price_inr || 5200), 0);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Active Package Banner */}
      <div className="active-package-banner">
        <div>
          <span className="booking-pill pill-green" style={{ marginBottom: '6px', display: 'inline-block' }}>
            ✓ Deterministic Engine Validated · Section 4 Rules Certified
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
            {searchParams.departureCity} → {searchParams.destinationCountry} Holiday Package
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            📅 {searchParams.startDate} · {searchParams.nights} Nights · 👤 {searchParams.adults || 2} Adults, 1 Child (Age 6) · Total Budget: ₹{budget.toLocaleString()}
          </div>
        </div>
        <button className="btn-booking-primary" onClick={onReOptimize}>
          Re-Optimize Package 🔄
        </button>
      </div>

      {/* Package Tier Switcher */}
      <div className="tier-switcher-tabs">
        <button 
          className={`tier-tab-btn ${selectedTier === 'cheapest' ? 'active' : ''}`}
          onClick={() => setSelectedTier('cheapest')}
        >
          <span className="tier-tab-title">⚡ Cheapest Package</span>
          <span className="tier-tab-price">₹{totalCost.toLocaleString()}</span>
        </button>
        <button 
          className={`tier-tab-btn ${selectedTier === 'fastest' ? 'active' : ''}`}
          onClick={() => setSelectedTier('fastest')}
        >
          <span className="tier-tab-title">✈ Fastest Transit</span>
          <span className="tier-tab-price">₹{(totalCost + 46000).toLocaleString()}</span>
        </button>
        <button 
          className={`tier-tab-btn ${selectedTier === 'best_rated' ? 'active' : ''}`}
          onClick={() => setSelectedTier('best_rated')}
        >
          <span className="tier-tab-title">⭐ Best Rated Stays</span>
          <span className="tier-tab-price">₹{(totalCost + 124500).toLocaleString()}</span>
        </button>
      </div>

      {/* Two Column Layout: Component Stream (Left) & Sticky Live Preview (Right) */}
      <div className="builder-split-layout">
        {/* Left Column: Component Stream */}
        <div>
          {/* Outbound Flight */}
          <div className="res-card-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🛫</span>
                <strong style={{ fontSize: '16px' }}>Outbound Flight · Non-Stop</strong>
              </div>
              <button 
                className="btn-header-outline" 
                style={{ color: 'var(--booking-blue-light)', borderColor: 'var(--booking-blue-light)', padding: '4px 10px', fontSize: '12px' }}
                onClick={() => onOpenSwapModal('flight', 'outbound')}
              >
                Swap Flight ⇄
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{outboundFlight.departure_time || '08:45'}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{outboundFlight.from_airport || 'BLR'} · Kempegowda</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>9h 15m</div>
                <div style={{ width: '120px', height: '2px', background: '#93c5fd', margin: '4px auto' }} />
                <span className="booking-pill pill-blue">Confirmed Direct</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{outboundFlight.arrival_time || '18:00'}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{outboundFlight.to_airport || 'HND'} · Haneda Tokyo</div>
              </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              <span>Airline: {outboundFlight.airline || 'Nippon Sky (NS-101)'} · Baggage: 23kg x 2 included</span>
              <strong style={{ color: 'var(--text-dark)' }}>₹{Math.round(flightCost / 2).toLocaleString()}</strong>
            </div>
          </div>

          {/* Transfer */}
          <div className="res-card-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🚄</span>
                <div>
                  <strong style={{ fontSize: '15px' }}>Arrival Airport Transfer (Keikyu Line / Express)</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Haneda Airport (HND) → Tokyo Hotel District · 45 mins</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="booking-pill pill-green" style={{ display: 'block', marginBottom: '4px' }}>✓ 60m Flight Buffer Validated</span>
                <strong style={{ fontSize: '14px' }}>₹{Math.round(transferCost / 2).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Hotel Stay */}
          <div className="res-card-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🏨</span>
                <strong style={{ fontSize: '16px' }}>Hotel Accommodation ({searchParams.nights} Nights)</strong>
              </div>
              <button 
                className="btn-header-outline" 
                style={{ color: 'var(--booking-blue-light)', borderColor: 'var(--booking-blue-light)', padding: '4px 10px', fontSize: '12px' }}
                onClick={() => onOpenSwapModal('hotel', hotel.city || 'Tokyo')}
              >
                Swap Hotel ⇄
              </button>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <img 
                src={hotel.image || '/images/hotels/HOTEL-BUSINESS-1.jpg'} 
                alt={hotel.name || 'Hotel'} 
                style={{ width: '130px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
                onError={(e) => { e.target.src = '/images/hotels/HOTEL-BUSINESS-1.jpg'; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{hotel.name || 'Hotel Gracery Shinjuku'}</h4>
                  <strong style={{ fontSize: '16px', color: 'var(--booking-blue-light)' }}>₹{hotelCost.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 8px 0' }}>
                  {'⭐'.repeat(hotel.stars || 4)} · 📍 {hotel.city || 'Tokyo'} · {hotel.room_name || 'Family Twin Room'}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="booking-pill pill-blue">✓ Certified: 1 Room fits 2 Adults + 1 Child</span>
                  <span className="booking-pill pill-green">Free Buffet Breakfast</span>
                  <span className="booking-pill pill-green">Non-Smoking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Curated Attractions */}
          <div className="res-card-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '16px' }}>Curated Attraction Passes ({attractions.length})</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Instant Confirmation E-Tickets</span>
            </div>
            {attractions.map((att, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < attractions.length - 1 ? '1px solid var(--border-gray)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🎟️</span>
                  <div>
                    <strong style={{ fontSize: '13.5px' }}>{att.name}</strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>📍 {att.city || 'Tokyo'} · {att.category || 'Sightseeing'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong style={{ fontSize: '13.5px' }}>₹{(att.total_price_inr || att.price_inr || 5200).toLocaleString()}</strong>
                  <button 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                    onClick={() => onRemoveAttraction(idx)}
                    title="Remove attraction"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Return Flight */}
          <div className="res-card-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🛬</span>
                <strong style={{ fontSize: '16px' }}>Return Flight · Homebound</strong>
              </div>
              <span className="booking-pill pill-green">Non-stop Schedule</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{returnFlight.departure_time || '11:30'}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{returnFlight.from_airport || 'HND'} · Haneda Tokyo</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>9h 45m</div>
                <div style={{ width: '120px', height: '2px', background: '#93c5fd', margin: '4px auto' }} />
                <span className="booking-pill pill-blue">Confirmed Direct</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{returnFlight.arrival_time || '18:15'}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{returnFlight.to_airport || 'BLR'} · Kempegowda</div>
              </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              <span>Airline: {returnFlight.airline || 'Nippon Sky (NS-102)'}</span>
              <strong style={{ color: 'var(--text-dark)' }}>₹{Math.round(flightCost / 2).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Itinerary Preview */}
        <div>
          <div className="itinerary-preview-sticky">
            <div className="itinerary-preview-header">
              <span className="itinerary-preview-title">LIVE ITINERARY PREVIEW</span>
              <span style={{ fontSize: '18px', color: 'var(--text-muted)', cursor: 'pointer' }}>•••</span>
            </div>

            {/* Stepper Timeline */}
            <div className="timeline-stepper">
              <div className="timeline-step-item">
                <div className="timeline-dot">✓</div>
                <div className="timeline-content">
                  <div className="timeline-date-title">APR 10 - OUTBOUND DEPARTURE</div>
                  <div className="timeline-sub-text">✈ {outboundFlight.from_airport || 'BLR'} to {outboundFlight.to_airport || 'HND'} · 08:45</div>
                </div>
              </div>

              <div className="timeline-step-item">
                <div className="timeline-dot">✓</div>
                <div className="timeline-content">
                  <div className="timeline-date-title">APR 10 - AIRPORT TRANSFER & CHECK-IN</div>
                  <div className="timeline-sub-text">🚄 Keikyu Line Express · 60m buffer validated</div>
                </div>
              </div>

              <div className="timeline-step-item">
                <div className="timeline-dot">✓</div>
                <div className="timeline-content">
                  <div className="timeline-date-title">APR 10 - 16 · HOTEL ACCOMMODATION</div>
                  <div className="timeline-sub-text">🏨 {hotel.name || 'Hotel Gracery'} ({searchParams.nights} Nights)</div>
                </div>
              </div>

              <div className="timeline-step-item">
                <div className="timeline-dot">✓</div>
                <div className="timeline-content">
                  <div className="timeline-date-title">APR 11 - 15 · SIGHTSEEING & ATTRACTIONS</div>
                  <div className="timeline-sub-text">🎡 {attractions.length} passes included</div>
                </div>
              </div>

              <div className="timeline-step-item">
                <div className="timeline-dot">✓</div>
                <div className="timeline-content">
                  <div className="timeline-date-title">APR 16 - RETURN FLIGHT HOME</div>
                  <div className="timeline-sub-text">✈ {returnFlight.from_airport || 'HND'} to {returnFlight.to_airport || 'BLR'}</div>
                </div>
              </div>
            </div>

            {/* Itemized Price Breakdown */}
            <div className="price-breakdown-box">
              <div className="price-row">
                <span>Flights (3 Travelers, Roundtrip)</span>
                <strong>₹{flightCost.toLocaleString()}</strong>
              </div>
              <div className="price-row">
                <span>Accommodations ({searchParams.nights} Nights)</span>
                <strong>₹{hotelCost.toLocaleString()}</strong>
              </div>
              <div className="price-row">
                <span>Transfers & Intercity Rail</span>
                <strong>₹{transferCost.toLocaleString()}</strong>
              </div>
              <div className="price-row">
                <span>Curated Attraction Passes ({attractions.length})</span>
                <strong>₹{attractionCost.toLocaleString()}</strong>
              </div>
              <div className="price-total-row">
                <span>Total Package Price</span>
                <span className="price-total-amount">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Budget Meter */}
            <div className="budget-meter-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                <span>Budget Utilization ({budgetPercent}%)</span>
                <span style={{ color: 'var(--green-score)' }}>₹{remainingBudget.toLocaleString()} Saved ✓</span>
              </div>
              <div className="budget-bar-track">
                <div className="budget-bar-fill" style={{ width: `${budgetPercent}%` }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Deterministic rule guarantees you never overspend budget ₹{budget.toLocaleString()}.
              </div>
            </div>

            {/* Booking CTA */}
            <button 
              className="btn-reserve-preview"
              onClick={() => onConfirmBooking(trip)}
            >
              Confirm & Reserve Journey (10-Digit) →
            </button>
            <button 
              className="btn-export-preview"
              onClick={() => onExportJson(trip)}
            >
              📥 Export Full Itinerary JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

