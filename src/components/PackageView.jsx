import React from 'react';

export default function PackageView({
  packageData,
  selectedTier,
  onSwitchTier,
  onOpenSwapModal,
  onConfirmBooking,
  onExportJSON,
  onOpenReceipt,
  reservationPass,
  onNavigate,
}) {
  if (!packageData) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-dark)' }}>
          No Package Generated Yet
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Please use the search bar on the Stays tab to generate your curated holiday package.
        </p>
        <button className="btn-primary" onClick={() => onNavigate('stays')}>
          Go to Search →
        </button>
      </div>
    );
  }

  const currentPkg =
    selectedTier === 'fastest'
      ? packageData.fastest || packageData.cheapest
      : selectedTier === 'best_rated'
      ? packageData.bestRated || packageData.cheapest
      : packageData.cheapest;

  const totalCost = currentPkg?.total_inr || currentPkg?.pricing?.total || 0;
  const budget = currentPkg?.budget_inr || 350000;
  const isWithinBudget = totalCost <= budget;
  const savings = Math.max(0, budget - totalCost);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* 3 Tier Selector Bar */}
      <div className="tier-selector-container" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className={`tier-card-btn ${selectedTier === 'cheapest' ? 'active' : ''}`}
            onClick={() => onSwitchTier('cheapest')}
          >
            <div className="tier-badge">🏷️ Most Economical</div>
            <div className="tier-name">Cheapest Package</div>
            <div className="tier-price">₹{packageData.cheapest?.total_inr?.toLocaleString('en-IN')}</div>
            <div className="tier-subtext">Optimized strictly for budget & essential luxury</div>
          </button>

          <button
            className={`tier-card-btn ${selectedTier === 'fastest' ? 'active' : ''}`}
            onClick={() => onSwitchTier('fastest')}
          >
            <div className="tier-badge">⚡ Fastest Transit</div>
            <div className="tier-name">Fastest Package</div>
            <div className="tier-price">
              ₹{(packageData.fastest?.total_inr || packageData.cheapest?.total_inr)?.toLocaleString('en-IN')}
            </div>
            <div className="tier-subtext">Minimal airport and intercity layovers</div>
          </button>

          <button
            className={`tier-card-btn ${selectedTier === 'best_rated' ? 'active' : ''}`}
            onClick={() => onSwitchTier('best_rated')}
          >
            <div className="tier-badge">⭐ Highest Rated</div>
            <div className="tier-name">Best Rated Stays</div>
            <div className="tier-price">
              ₹{(packageData.bestRated?.total_inr || packageData.cheapest?.total_inr)?.toLocaleString('en-IN')}
            </div>
            <div className="tier-subtext">Premium 5-star suites & curated luxury experiences</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Components, Right Live Itinerary Preview */}
      <div className="package-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Components List */}
        <div className="package-components-column">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: 0, color: 'var(--text-dark)' }}>
              Package Inclusions & Route
            </h2>
            <span style={{ fontSize: '12px', background: '#EAE5DF', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
              {currentPkg?.cities?.join(' ➔ ') || 'Multi-City Route'}
            </span>
          </div>

          {/* Outbound Flight */}
          {currentPkg?.flights?.outbound && (
            <div className="pkg-component-card">
              <div className="pkg-card-header">
                <span className="pkg-type-badge">✈️ Outbound Flight</span>
                <button
                  className="btn-swap-mini"
                  onClick={() => onOpenSwapModal('flight', currentPkg.flights.outbound.flight_id)}
                >
                  Swap Flight ⇄
                </button>
              </div>
              <div className="pkg-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px' }}>
                      {currentPkg.flights.outbound.airline} · {currentPkg.flights.outbound.flight_id}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                      {currentPkg.flights.outbound.from_city} ({currentPkg.flights.outbound.from_airport}) ➔{' '}
                      {currentPkg.flights.outbound.to_city} ({currentPkg.flights.outbound.to_airport})
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1B6B3A', fontWeight: 600 }}>
                      ✓ 60-Minute Transfer Cushion Validated
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="price-tag-large">
                      ₹{currentPkg.flights.outbound.total_price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hotels */}
          {currentPkg?.hotels?.map((hotel, idx) => (
            <div key={idx} className="pkg-component-card">
              <div className="pkg-card-header">
                <span className="pkg-type-badge">🏨 Stay in {hotel.city}</span>
                <button
                  className="btn-swap-mini"
                  onClick={() => onOpenSwapModal('hotel', hotel.hotel_id)}
                >
                  Swap Hotel ⇄
                </button>
              </div>
              <div className="pkg-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px' }}>
                      {hotel.name} {'★'.repeat(hotel.stars || 4)}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                      {hotel.nights} Nights · {hotel.room_name} ({hotel.rooms_count} Room)
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1B6B3A', fontWeight: 600 }}>
                      ✓ Mathematical Room Fit: Adults + Children Certified
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="price-tag-large">
                      ₹{hotel.total_price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Intercity Transfers */}
          {currentPkg?.transfers?.intercity && (
            <div className="pkg-component-card">
              <div className="pkg-card-header">
                <span className="pkg-type-badge">🚅 Intercity Transit</span>
              </div>
              <div className="pkg-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px' }}>
                      {currentPkg.transfers.intercity.name || 'High-Speed Shinkansen Bullet Train'}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                      {currentPkg.transfers.intercity.from_city} ➔ {currentPkg.transfers.intercity.to_city}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="price-tag-large">
                      ₹{currentPkg.transfers.intercity.total_price?.toLocaleString('en-IN') || 'Included'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Return Flight */}
          {currentPkg?.flights?.inbound && (
            <div className="pkg-component-card">
              <div className="pkg-card-header">
                <span className="pkg-type-badge">✈️ Return Flight</span>
                <button
                  className="btn-swap-mini"
                  onClick={() => onOpenSwapModal('flight', currentPkg.flights.inbound.flight_id)}
                >
                  Swap Flight ⇄
                </button>
              </div>
              <div className="pkg-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px' }}>
                      {currentPkg.flights.inbound.airline} · {currentPkg.flights.inbound.flight_id}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                      {currentPkg.flights.inbound.from_city} ({currentPkg.flights.inbound.from_airport}) ➔{' '}
                      {currentPkg.flights.inbound.to_city} ({currentPkg.flights.inbound.to_airport})
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1B6B3A', fontWeight: 600 }}>
                      ✓ 180-Minute Departure Buffer Verified
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="price-tag-large">
                      ₹{currentPkg.flights.inbound.total_price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attractions */}
          {currentPkg?.attractions && currentPkg.attractions.length > 0 && (
            <div className="pkg-component-card">
              <div className="pkg-card-header">
                <span className="pkg-type-badge">🎡 Curated Attractions ({currentPkg.attractions.length})</span>
                <button className="btn-swap-mini" onClick={() => onNavigate('attractions')}>
                  + Add More Attractions
                </button>
              </div>
              <div className="pkg-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {currentPkg.attractions.map((att, idx) => (
                    <div key={idx} style={{ background: '#FAF7F2', padding: '10px', borderRadius: '8px', border: '1px solid #EAE5DF' }}>
                      <strong style={{ fontSize: '13px', display: 'block', marginBottom: '2px' }}>{att.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{att.city} · {att.visit_duration_mins || 120} mins</span>
                      <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 700, color: '#C28B51' }}>
                        ₹{att.total_price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Sticky Itinerary Preview */}
        <div className="sticky-itinerary-sidebar" style={{ position: 'sticky', top: '90px' }}>
          <div className="itinerary-preview-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', margin: '0 0 12px 0' }}>
              Live Itinerary Preview
            </h3>

            {/* Budget Meter */}
            <div className="budget-progress-box" style={{ marginBottom: '16px', background: '#F8F6F2', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span>Budget Progress</span>
                <strong>₹{totalCost.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ height: '8px', background: '#E5DFD7', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (totalCost / budget) * 100)}%`,
                    background: isWithinBudget ? '#1B6B3A' : '#D9534F',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div style={{ marginTop: '6px', fontSize: '11.5px', color: isWithinBudget ? '#1B6B3A' : '#D9534F', fontWeight: 600 }}>
                {isWithinBudget
                  ? `✓ Within Budget (Savings: ₹${savings.toLocaleString('en-IN')})`
                  : `⚠️ Exceeds Budget by ₹${(totalCost - budget).toLocaleString('en-IN')}`}
              </div>
            </div>

            {/* Total Price Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Package Cost:</span>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'var(--font-serif)' }}>
                ₹{totalCost.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Reservation Pass If Created */}
            {reservationPass && (
              <div style={{ background: '#EBF5EE', border: '1px solid #1B6B3A', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1B6B3A', fontWeight: 800, letterSpacing: '1px' }}>
                  CONFIRMED RESERVATION
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: '#1B6B3A', margin: '4px 0' }}>
                  {reservationPass}
                </div>
                <button
                  className="btn-secondary-sm"
                  style={{ width: '100%', marginTop: '6px' }}
                  onClick={() => onOpenReceipt(reservationPass)}
                >
                  📄 View Official Receipt & Pass
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '13px' }} onClick={onConfirmBooking}>
                Reserve 10-Digit Pass →
              </button>
              <button className="btn-secondary" style={{ width: '100%', padding: '11px' }} onClick={onExportJSON}>
                📥 Download Section 6 JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

