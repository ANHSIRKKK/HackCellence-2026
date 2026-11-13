import React from 'react';

export default function SpiritualView({ onBookPilgrimInstant }) {
  const pilgrimages = [
    {
      id: 'PIL-CD',
      title: 'Char Dham Yatra by Helicopter · VIP Darshan',
      route: 'Dehradun → Yamunotri → Gangotri → Kedarnath → Badrinath',
      duration: '6 Days · 5 Nights',
      price: 185000,
      highlights: ['Helicopter Transfer', 'Priority VIP Darshan', 'Medical Oxygen Kit', 'Pure Sattvic Meals'],
      image: '/images/hotels/HOTEL-BUSINESS-2.jpg'
    },
    {
      id: 'PIL-KV',
      title: 'Kashi Vishwanath & Ayodhya Ram Mandir Parikrama',
      route: 'Varanasi (Ganga Aarti) → Sarnath → Ayodhya (Ram Janmabhoomi)',
      duration: '5 Days · 4 Nights',
      price: 48000,
      highlights: ['Wheelchair Assistance', 'Private AC Innova', 'Ganga Boating VIP', 'Dedicated Senior Escort'],
      image: '/images/hotels/HOTEL-TWIN-1.jpg'
    },
    {
      id: 'PIL-TB',
      title: 'Tirupati Balaji Sheegra Darshan & Sri Kalahasti',
      route: 'Chennai / Bengaluru → Tirumala Hills → Sri Kalahasti',
      duration: '3 Days · 2 Nights',
      price: 24500,
      highlights: ['Official Special Entry Darshan Pass', 'Laddu Prasadam Kit', 'Driver Cum Guide', '4-Star Stay'],
      image: '/images/hotels/HOTEL-LUXURY-1.jpg'
    },
    {
      id: 'PIL-VD',
      title: 'Mata Vaishno Devi Bhawan & Shiv Khori Yatra',
      route: 'Jammu Tawi → Katra → Bhawan (Battery Car / Ropeway) → Shiv Khori',
      duration: '4 Days · 3 Nights',
      price: 29000,
      highlights: ['Battery Car Assistance', 'Bhairon Baba Ropeway', 'VIP Aarti Pass', 'Katra 4-Star Accommodations'],
      image: '/images/hotels/HOTEL-RYOKAN-1.jpg'
    }
  ];

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 36px auto' }}>
        <span className="booking-pill pill-yellow" style={{ fontSize: '13px', padding: '6px 14px', marginBottom: '8px', display: 'inline-block' }}>
          ⛩️ Dedicated Elder-Care & Senior Citizen Pilgrimages
        </span>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
          Tirth Yatra: Booking a Blessed Holiday for Parents
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          As highlighted in the brief, children often book holidays for their parents. Every pilgrimage package includes complete end-to-end assistance: VIP darshan access, sanitized sattvic dining, wheelchair assistance, and non-stop safety buffers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {pilgrimages.map(p => (
          <div key={p.id} className="res-card-full" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span className="booking-pill pill-blue">{p.duration}</span>
                <strong style={{ fontSize: '20px', color: 'var(--booking-blue-light)' }}>
                  ₹{p.price.toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/person</span>
                </strong>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
                {p.title}
              </h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                📍 {p.route}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {p.highlights.map((h, i) => (
                  <span key={i} className="booking-pill pill-green">✓ {h}</span>
                ))}
              </div>
            </div>
            <button 
              className="btn-booking-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => onBookPilgrimInstant(p.title, p.price)}
            >
              Book Tirth Yatra for Parents (Instant 10-Digit Hold) →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

