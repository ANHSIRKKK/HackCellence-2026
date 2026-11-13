import React, { useState, useEffect } from 'react';

export default function AttractionsView({ onAddAttractionToPackage, onNavigate }) {
  const [attractions, setAttractions] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/attractions')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.attractions) {
          setAttractions(data.attractions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load attractions:', err);
        setLoading(false);
      });
  }, []);

  const cities = ['all', 'Tokyo', 'Kyoto', 'Osaka', 'Dubai', 'Abu Dhabi'];
  const categories = ['all', 'Heritage', 'Culture', 'Modern', 'Theme Park', 'Nature'];

  const filtered = attractions.filter((att) => {
    const matchCity = selectedCity === 'all' || att.city.toLowerCase() === selectedCity.toLowerCase();
    const matchCat = selectedCat === 'all' || (att.category && att.category.toLowerCase().includes(selectedCat.toLowerCase()));
    return matchCity && matchCat;
  });

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '22px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#C28B51', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          🎡 56 CURATED EXPERIENCES
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, color: 'var(--text-dark)', margin: '6px 0 4px 0' }}>
          Explore Verified Attractions & Day Passes
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', maxWidth: '680px' }}>
          Strictly verified opening hours, visit durations, and zero-overlap scheduling inside your holiday package.
        </p>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {cities.map((c) => (
          <button
            key={c}
            className={`filter-pill ${selectedCity === c ? 'active' : ''}`}
            onClick={() => setSelectedCity(c)}
          >
            {c === 'all' ? 'All Cities' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading 56 Verified Attractions...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.slice(0, 24).map((att) => (
            <div key={att.id} className="attraction-card-luxury" style={{ background: '#FFFFFF', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E4DCD0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={`/images/attractions/${att.image_filename || 'att_tokyo_sensoji.jpg'}`}
                  alt={att.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/images/attractions/att_tokyo_sensoji.jpg';
                  }}
                />
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(24, 21, 19, 0.85)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                  {att.city}
                </span>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', color: 'var(--text-dark)' }}>{att.name}</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                    ⏱️ Visit Duration: {att.visit_duration_mins || 120} mins · Hours: {att.opening_time || '09:00'} - {att.closing_time || '18:00'}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F0EBE3' }}>
                  <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-dark)' }}>
                    ₹{(att.price_per_adult || att.price || 1500).toLocaleString('en-IN')}
                    <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}> / adult</span>
                  </span>
                  <button
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => {
                      onAddAttractionToPackage(att);
                      onNavigate('package');
                    }}
                  >
                    + Add to Package
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

