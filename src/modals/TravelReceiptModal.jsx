import React, { useState, useEffect } from 'react';

export default function TravelReceiptModal({ isOpen, onClose, reference }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !reference) return;
    setLoading(true);
    fetch(`/api/reservations/${reference}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.reservation) {
          setBooking(data.reservation);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load reservation receipt:', err);
        setLoading(false);
      });
  }, [isOpen, reference]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', background: '#FFF' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid #EAE5DF', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
              Official Travel Voucher & Boarding Pass
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              10-Digit Reservation Code: <strong>#{reference}</strong>
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ padding: '24px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Generating official voucher...</div>
          ) : !booking ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Booking #{reference} not found.
            </div>
          ) : (
            <div className="printable-voucher-body">
              {/* Top Banner with Paid in Full stamp */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px dashed #E0D9CE' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', fontSize: '24px' }}>
                    TRIPRISE LUXURY PASS
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Destination: {booking.country || 'Japan'} · Confirmed on {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div style={{ border: '2px solid #1B6B3A', color: '#1B6B3A', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', transform: 'rotate(-4deg)' }}>
                  PAID IN FULL · LOCKED
                </div>
              </div>

              {/* Traveler & Route Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: '#FAF7F2', padding: '16px', borderRadius: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Primary Traveler / Party</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '2px' }}>
                    {booking.traveler_name || 'Menon Family'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Party Size: {booking.travelers_count || 3} Guests
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Travel Dates</span>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '2px' }}>
                    {booking.dates?.start || '10 April 2027'} ➔ {booking.dates?.end || '16 April 2027'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Duration: {booking.nights || 6} Nights
                  </div>
                </div>
              </div>

              {/* Inclusions Breakdown */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', color: '#8C847A', letterSpacing: '0.8px' }}>
                  Confirmed Inclusions
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '8px 0', borderBottom: '1px solid #F0EBE3' }}>
                    <span>✈️ Outbound & Inbound Flights</span>
                    <strong>Verified (Buffer Certified)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '8px 0', borderBottom: '1px solid #F0EBE3' }}>
                    <span>🏨 Luxury Hotel Accommodation</span>
                    <strong>Room Fit Certified</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '8px 0', borderBottom: '1px solid #F0EBE3' }}>
                    <span>🚅 Chauffeur / Bullet Train Transfers</span>
                    <strong>Schedule Aligned</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '8px 0', borderBottom: '1px solid #F0EBE3' }}>
                    <span>🎡 Curated Attractions & VIP Access</span>
                    <strong>Included</strong>
                  </div>
                </div>
              </div>

              {/* Total Price Lock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F5EE', padding: '16px', borderRadius: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Total Guaranteed Amount:</span>
                <span style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-dark)' }}>
                  ₹{booking.total_inr?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #EAE5DF', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={() => window.print()}>
            🖨️ Print / Save as PDF
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

