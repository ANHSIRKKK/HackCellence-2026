import React, { useState } from 'react';

export default function SpiritualView({ onOpenCustomizer, onInstantBook }) {
  const [activeCircuit, setActiveCircuit] = useState('all');

  const circuits = [
    {
      id: 'chardham',
      name: 'Char Dham Deluxe Yatra (Helicopter VIP Darshan)',
      location: 'Uttarakhand Himalayas · 6 Nights / 7 Days',
      route: 'Dehradun ➔ Yamunotri ➔ Gangotri ➔ Kedarnath ➔ Badrinath',
      stars: 5,
      price: 185000,
      image: '/images/attractions/att_kyo_kinkakuji.jpg',
      badge: '🚁 VIP Helicopter & Helipad Darshan',
      inclusions: [
        'Direct flight to Kedarnath helipad (zero trek)',
        '100% pure vegetarian Sattvic temple ghee meals',
        '24/7 Paramedic & Oxygen cylinder onboard',
        'Ground-floor senior suite with heating & anti-skid rails',
      ],
    },
    {
      id: 'kashi',
      name: 'Kashi Vishwanath, Ayodhya Ram Mandir & Prayagraj Sangam',
      location: 'Uttar Pradesh Divine Corridor · 5 Nights / 6 Days',
      route: 'Varanasi ➔ Ayodhya ➔ Prayagraj',
      stars: 5,
      price: 92000,
      image: '/images/attractions/att_auh_sheikh_zayed_mosque.jpg',
      badge: '🛺 Battery Buggy & Direct Sanctum Pass',
      inclusions: [
        'Sugam Darshan VIP Pass (no queues at Kashi)',
        'Private Bajra boat cruise on holy Ganga for Aarti',
        'Chauffeur driven AC Innova Crysta throughout',
        'Ayurvedic senior foot therapy & temple pandit escort',
      ],
    },
    {
      id: 'tirupati',
      name: 'Tirupati Balaji & Madurai Meenakshi Divine Tour',
      location: 'South India Sacred Circuit · 4 Nights / 5 Days',
      route: 'Chennai ➔ Tirumala / Tirupati ➔ Madurai',
      stars: 5,
      price: 74000,
      image: '/images/attractions/att_tokyo_sensoji.jpg',
      badge: '🙏 Seeghra Darshan (Zero Wait)',
      inclusions: [
        'Official TTD VIP Seeghra Darshan pre-booked pass',
        'Personal temple attendant escorting parents inside',
        'Pure South Indian vegetarian traditional Satvik meals',
        'Wheelchair assistance at temple entrance gates',
      ],
    },
  ];

  const filtered = circuits.filter((c) => activeCircuit === 'all' || c.id === activeCircuit);

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '22px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#C28B51', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          ⛩️ SACRED TIRTH YATRA
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, color: 'var(--text-dark)', margin: '6px 0 4px 0' }}>
          Curated Pilgrimage Experiences for Senior Parents
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', maxWidth: '680px' }}>
          Dedicated elder-care: Helicopter access, pure Sattvic dining, wheelchair assistance, and pre-booked VIP Darshan.
        </p>
      </div>

      {/* Elder-Care Trust Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
          background: '#FAF7F2',
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid #EAE5DF',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '26px' }}>🩺</span>
          <div>
            <strong style={{ fontSize: '13.5px', display: 'block' }}>24/7 Paramedic & Oxygen</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Emergency medical kit & on-call doctor</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '26px' }}>♿</span>
          <div>
            <strong style={{ fontSize: '13.5px', display: 'block' }}>Zero-Trek & Wheelchair</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Buggy & dedicated porter at all gates</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '26px' }}>🍲</span>
          <div>
            <strong style={{ fontSize: '13.5px', display: 'block' }}>Pure Sattvic Dining</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Zero onion/garlic, temple ghee preparation</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '26px' }}>🏨</span>
          <div>
            <strong style={{ fontSize: '13.5px', display: 'block' }}>Ground-Floor Senior Stays</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Elevator access & anti-skid bathroom rails</span>
          </div>
        </div>
      </div>

      {/* Circuit Cards */}
      <div style={{ display: 'grid', gap: '24px' }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E4DCD0',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1.2fr 2fr 1.2fr',
            }}
          >
            <div style={{ position: 'relative', minHeight: '220px' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#9E2A2B', color: '#FFF', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
                {item.badge}
              </span>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#C28B51', fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.location}
                </span>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', margin: '4px 0 8px 0', color: 'var(--text-dark)' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#6A6359', margin: '0 0 14px 0', fontWeight: 600 }}>
                  Route: {item.route}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {item.inclusions.map((inc, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#4A453E', display: 'flex', gap: '6px' }}>
                      <span style={{ color: '#1B6B3A' }}>✓</span> {inc}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', background: '#FCFAF7', borderLeft: '1px solid #EAE5DF', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Starting price for 2 Seniors</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'var(--font-serif)', margin: '4px 0 14px 0' }}>
                ₹{item.price.toLocaleString('en-IN')}
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', marginBottom: '8px', padding: '11px' }}
                onClick={() => onOpenCustomizer(item)}
              >
                Customize Yatra & Health ⚙️
              </button>
              <button
                className="btn-secondary"
                style={{ width: '100%', padding: '9px', fontSize: '12.5px' }}
                onClick={() => onInstantBook(item)}
              >
                Reserve (10-Digit Pass) →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

