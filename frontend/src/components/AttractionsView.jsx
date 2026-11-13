import React, { useState, useEffect } from 'react';
import { fetchAttractions } from '../api';

export default function AttractionsView({ onAddAttractionToPackage, showToast }) {
  const [cityFilter, setCityFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttractions();
  }, [cityFilter, catFilter]);

  async function loadAttractions() {
    setLoading(true);
    try {
      const data = await fetchAttractions({ city: cityFilter, category: catFilter });
      if (data.success && data.attractions) {
        setAttractions(data.attractions);
      }
    } catch (err) {
      console.error('Attractions load error:', err);
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

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'cultural', label: '⛩️ Temples & Culture' },
    { id: 'theme_park', label: '🧸 Theme Parks' },
    { id: 'sightseeing', label: '🗼 Sightseeing & Views' },
    { id: 'nature', label: '🌸 Nature & Parks' },
    { id: 'family', label: '👨‍👩‍👧 Family Fun' }
  ];

  return (
    <div>
      {/* Header Banner */}
      <section className="attractions-hero-section">
        <div className="container">
          <h1 className="hero-title-main" style={{ fontSize: '32px' }}>
            Attractions, activities and experiences
          </h1>
          <p className="hero-subtitle-main">
            Discover 56 curated catalog experiences with guaranteed child rates & instant e-vouchers
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
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

        {/* Category Filter Pills */}
        <div className="filter-pills-bar" style={{ marginBottom: '24px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn-pill ${catFilter === cat.id ? 'active' : ''}`}
              onClick={() => setCatFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading catalog attractions...
          </div>
        ) : (
          <div className="attractions-catalog-grid">
            {attractions.map(att => {
              const price = att.price_inr || (att.price_per_adult ? att.price_per_adult.amount : 5200);

              return (
                <div key={att.attraction_id} className="attraction-card-catalog">
                  <img 
                    src={att.image || '/images/attractions/ATT-TYO-001.jpg'} 
                    alt={att.name}
                    className="attraction-img-top"
                    onError={(e) => { e.target.src = '/images/attractions/ATT-TYO-001.jpg'; }}
                  />
                  <div className="attraction-body">
                    <div>
                      <span className="attraction-cat-badge">{att.category || 'Experience'}</span>
                      <h4 className="attraction-title">{att.name}</h4>
                      <div className="attraction-meta-row">
                        <span>📍 {att.city}</span>
                        <span>⏱ {att.duration_hours || 3} hours</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        ⭐ 4.8 (850+ reviews)
                      </div>
                    </div>
                    <div>
                      <div className="attraction-price-row">
                        <div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>From</div>
                          <strong style={{ fontSize: '16px', color: 'var(--text-dark)' }}>
                            ₹{price.toLocaleString()}
                          </strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}> /person</span>
                        </div>
                        <button 
                          className="btn-booking-primary"
                          style={{ padding: '6px 14px', fontSize: '12.5px' }}
                          onClick={() => {
                            onAddAttractionToPackage(att);
                            showToast(`+ Added ${att.name} to active package!`);
                          }}
                        >
                          + Add to Package
                        </button>
                      </div>
                    </div>
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
