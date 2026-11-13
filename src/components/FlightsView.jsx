import React, { useState } from 'react';

export default function FlightsView({ onSelectFlightAndSearch }) {
  const [selectedAirline, setSelectedAirline] = useState('all');
  const [flightType, setFlightType] = useState('roundtrip');

  const sampleFlights = [
    {
      id: 'FL-NS-101',
      airline: 'Nippon Sky',
      logo: '🌸',
      from: 'Bengaluru (BLR)',
      to: 'Tokyo (NRT)',
      depTime: '22:30',
      arrTime: '08:45 (+1d)',
      duration: '6h 45m',
      type: 'Direct Non-stop',
      seats: 9,
      price: 42500,
    },
    {
      id: 'FL-AV-204',
      airline: 'AirVeda',
      logo: '✈️',
      from: 'Bengaluru (BLR)',
      to: 'Tokyo (HND)',
      depTime: '20:15',
      arrTime: '07:20 (+1d)',
      duration: '7h 35m',
      type: '1-Stop Priority',
      seats: 7,
      price: 38200,
    },
    {
      id: 'FL-SL-308',
      airline: 'Sandline Express',
      logo: '🐪',
      from: 'Bengaluru (BLR)',
      to: 'Dubai (DXB)',
      depTime: '04:10',
      arrTime: '06:40',
      duration: '4h 00m',
      type: 'Direct Non-stop',
      seats: 8,
      price: 18500,
    },
    {
      id: 'FL-SW-405',
      airline: 'SilkWay Airways',
      logo: '🌟',
      from: 'Delhi (DEL)',
      to: 'Tokyo (NRT)',
      depTime: '23:00',
      arrTime: '09:10 (+1d)',
      duration: '6h 40m',
      type: 'Direct Non-stop',
      seats: 6,
      price: 45000,
    },
  ];

  const filtered = sampleFlights.filter(
    (f) => selectedAirline === 'all' || f.airline.toLowerCase().includes(selectedAirline.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '22px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#C28B51', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          ✈️ GLOBAL AIRLINE NETWORK
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, color: 'var(--text-dark)', margin: '6px 0 4px 0' }}>
          Compare & Select Verified Flights
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', maxWidth: '680px' }}>
          Real seat inventory, verified buffer windows, and direct pairing with luxury accommodations.
        </p>
      </div>

      {/* Flight Filter Pills */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'Nippon Sky', 'AirVeda', 'Sandline Express', 'SilkWay'].map((air) => (
          <button
            key={air}
            className={`filter-pill ${selectedAirline === air ? 'active' : ''}`}
            onClick={() => setSelectedAirline(air)}
          >
            {air === 'all' ? 'All Airlines' : air}
          </button>
        ))}
      </div>

      {/* Flight Cards Grid */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filtered.map((flight) => (
          <div key={flight.id} className="flight-catalog-card" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E4DCD0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '32px', background: '#F8F5EE', padding: '12px', borderRadius: '12px', border: '1px solid #EAE5DF' }}>
                {flight.logo}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '16px' }}>{flight.airline}</strong>
                  <span style={{ fontSize: '12px', background: '#EAE5DF', padding: '2px 8px', borderRadius: '10px' }}>{flight.id}</span>
                  <span style={{ fontSize: '11.5px', color: '#1B6B3A', fontWeight: 600 }}>● {flight.seats} Seats Left</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
                  {flight.depTime} ({flight.from}) ➔ {flight.arrTime} ({flight.to})
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Duration: {flight.duration} · {flight.type}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                ₹{flight.price.toLocaleString('en-IN')}
                <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}> / seat</span>
              </div>
              <button
                className="btn-primary"
                style={{ padding: '9px 18px', fontSize: '13px' }}
                onClick={() => onSelectFlightAndSearch(flight)}
              >
                Select Flight & Build Package →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

