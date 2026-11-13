import React, { useState, useEffect } from 'react';

export default function BookingsView({ onOpenReceipt, onDownloadJSON }) {
  const [reservations, setReservations] = useState([]);
  const [lookupRef, setLookupRef] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    fetch('/api/reservations')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.reservations) {
          setReservations(data.reservations);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleLookup = () => {
    if (!lookupRef.trim()) return;
    fetch(`/api/reservations/${lookupRef.trim()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.reservation) {
          setReservations([data.reservation]);
        } else {
          alert('Reservation not found. Please verify the 10-digit number.');
        }
      })
      .catch(() => alert('Reservation lookup failed.'));
  };

  const handleCancel = (reference) => {
    if (!window.confirm(`Are you sure you want to cancel reservation ${reference}? Inventory will be released.`)) return;
    fetch(`/api/reservations/${reference}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          alert(`Reservation ${reference} has been cancelled successfully.`);
          fetchBookings();
        } else {
          alert('Could not cancel reservation.');
        }
      });
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '22px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#C28B51', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          📋 VERIFIED BOOKINGS
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, color: 'var(--text-dark)', margin: '6px 0 4px 0' }}>
          My Reservations & Boarding Passes
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', maxWidth: '680px' }}>
          Real-time inventory locks, official travel receipts, and Section 6 JSON downloads surviving all server restarts.
        </p>
      </div>

      {/* 10-Digit Lookup Bar */}
      <div style={{ background: '#FFFFFF', padding: '18px 24px', borderRadius: '12px', border: '1px solid #E4DCD0', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '20px' }}>🔍</span>
        <input
          type="text"
          placeholder="Enter 10-digit reservation number (e.g. 6336193810)..."
          value={lookupRef}
          onChange={(e) => setLookupRef(e.target.value)}
          className="search-cell-input"
          style={{ flex: 1, fontSize: '14.5px' }}
        />
        <button className="btn-primary" onClick={handleLookup} style={{ padding: '10px 20px' }}>
          Lookup Reservation →
        </button>
        <button className="btn-secondary" onClick={fetchBookings} style={{ padding: '10px 16px' }}>
          Reset
        </button>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading saved reservations...
        </div>
      ) : reservations.length === 0 ? (
        <div style={{ background: '#FFF', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #E4DCD0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No reservations found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {reservations.map((res) => (
            <div
              key={res.reference}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E4DCD0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: '#1B6B3A', color: '#FFF', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    {res.status || 'BOOKED'}
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-dark)', fontFamily: 'monospace' }}>
                    #{res.reference}
                  </strong>
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {res.traveler_name || 'Menon Family'} · {res.country || 'Japan'} ({res.dates?.start || '10 Apr 2027'} - {res.dates?.end || '16 Apr 2027'})
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Party: {res.travelers_count || 3} travelers · Total Locked: ₹{res.total_inr?.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  onClick={() => onOpenReceipt(res.reference)}
                >
                  📄 View Official Receipt & Pass
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  onClick={() => onDownloadJSON(res.reference)}
                >
                  📥 Download JSON
                </button>
                <button
                  className="btn-secondary-sm"
                  style={{ padding: '8px 12px', color: '#D9534F', borderColor: '#D9534F' }}
                  onClick={() => handleCancel(res.reference)}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

