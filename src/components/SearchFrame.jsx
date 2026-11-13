import React from 'react';

export default function SearchFrame({
  searchParams,
  setSearchParams,
  onSearch,
  onOpenGuestModal,
  onApplyPreset,
}) {
  const handleChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const guestSummary = `${searchParams.adults} adults${
    searchParams.children > 0
      ? ` · ${searchParams.children} child (age ${searchParams.childAges.join(', ')})`
      : ''
  }`;

  return (
    <div className="search-frame-wrapper" style={{ marginBottom: '28px' }}>
      <div className="yellow-search-frame">
        {/* Field 1: Departure & Destination */}
        <div className="search-cell">
          <span className="search-cell-icon">🛏️</span>
          <div className="search-cell-content" style={{ minWidth: 0 }}>
            <span className="search-cell-label">Departure & Destination</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', minWidth: 0 }}>
              <select
                value={searchParams.depCity}
                onChange={(e) => handleChange('depCity', e.target.value)}
                className="search-cell-select"
                style={{ flex: 1, minWidth: 0 }}
              >
                <option value="Bengaluru">Bengaluru (BLR)</option>
                <option value="Delhi">Delhi (DEL)</option>
                <option value="Mumbai">Mumbai (BOM)</option>
                <option value="Chennai">Chennai (MAA)</option>
              </select>
              <span style={{ color: '#8C847A', fontSize: '13px', flexShrink: 0 }}>➔</span>
              <select
                value={searchParams.destCountry}
                onChange={(e) => handleChange('destCountry', e.target.value)}
                className="search-cell-select"
                style={{ flex: 1.2, minWidth: 0 }}
              >
                <option value="Japan">Japan (Tokyo/Kyoto)</option>
                <option value="United Arab Emirates">UAE (Dubai/Abu Dhabi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Field 2: Dates & Nights */}
        <div className="search-cell">
          <span className="search-cell-icon">📅</span>
          <div className="search-cell-content">
            <span className="search-cell-label">Check-in — Check-out (Nights)</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={searchParams.startDate}
                min="2027-04-01"
                max="2027-04-20"
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="search-cell-input"
                style={{ width: '130px' }}
              />
              <select
                value={searchParams.nights}
                onChange={(e) => handleChange('nights', parseInt(e.target.value, 10))}
                className="search-cell-select"
                style={{ minWidth: '85px' }}
              >
                <option value={3}>3 Nights</option>
                <option value={4}>4 Nights</option>
                <option value={5}>5 Nights</option>
                <option value={6}>6 Nights</option>
                <option value={7}>7 Nights</option>
                <option value={8}>8 Nights</option>
                <option value={9}>9 Nights</option>
                <option value={10}>10 Nights</option>
              </select>
            </div>
          </div>
        </div>

        {/* Field 3: Guests & Rooms */}
        <div className="search-cell" onClick={onOpenGuestModal} style={{ cursor: 'pointer' }}>
          <span className="search-cell-icon">👤</span>
          <div className="search-cell-content" style={{ minWidth: 0 }}>
            <span className="search-cell-label">Guests & Occupancy</span>
            <div
              className="search-cell-value"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--text-dark)',
              }}
            >
              {guestSummary} ▾
            </div>
          </div>
        </div>

        {/* Field 4: Budget */}
        <div className="search-cell">
          <span className="search-cell-icon">₹</span>
          <div className="search-cell-content">
            <span className="search-cell-label">Holiday Budget</span>
            <input
              type="number"
              step="5000"
              value={searchParams.budget}
              onChange={(e) => handleChange('budget', parseInt(e.target.value, 10) || 0)}
              className="search-cell-input"
              placeholder="Budget in INR"
              style={{ fontWeight: 700 }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button className="search-submit-btn" onClick={onSearch}>
          Check Availability →
        </button>
      </div>

      {/* Popular Suggestions Row */}
      <div className="quick-suggestion-row">
        <span className="suggestion-lead-label">💡 Popular Suggestions:</span>
        <button
          className="suggestion-chip"
          onClick={() =>
            onApplyPreset('Bengaluru', 'Japan', '2027-04-10', 6, 2, 1, [6], 350000)
          }
        >
          🌸 Tokyo & Kyoto · 6 Nights · 2A+1C · ₹3.5L
        </button>
        <button
          className="suggestion-chip"
          onClick={() =>
            onApplyPreset('Delhi', 'United Arab Emirates', '2027-04-05', 4, 2, 0, [], 250000)
          }
        >
          🏙️ Dubai & Abu Dhabi · 4 Nights · 2 Adults · ₹2.5L
        </button>
        <button
          className="suggestion-chip"
          onClick={() =>
            onApplyPreset('Mumbai', 'Japan', '2027-04-08', 8, 2, 1, [6], 380000)
          }
        >
          🏯 Japan Grand Tour · 8 Nights · 2A+1C · ₹3.8L
        </button>
        <button
          className="suggestion-chip"
          onClick={() => onApplyPreset('pilgrim')}
        >
          ⛩️ Char Dham & Sacred Yatra · Curated for Parents
        </button>
      </div>
    </div>
  );
}

