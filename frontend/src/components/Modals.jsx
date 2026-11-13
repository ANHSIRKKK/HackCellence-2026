import React, { useState, useEffect } from 'react';
import { fetchFlights, fetchHotels } from '../api';

export function GuestModal({ isOpen, onClose, guestState, setGuestState }) {
  if (!isOpen) return null;

  const [adults, setAdults] = useState(guestState.adults);
  const [children, setChildren] = useState(guestState.children);
  const [childAges, setChildAges] = useState([...guestState.childAges]);

  function handleSave() {
    setGuestState({ adults, children, childAges });
    onClose();
  }

  function handleChildrenCountChange(newCount) {
    const val = Math.max(0, Math.min(4, newCount));
    setChildren(val);
    const newAges = [...childAges];
    while (newAges.length < val) newAges.push(6);
    while (newAges.length > val) newAges.pop();
    setChildAges(newAges);
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-window">
        <h3 className="modal-title">Select Guests & Occupancy</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Adults</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ages 18 or above</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              className="btn-header-outline" 
              style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
              onClick={() => setAdults(Math.max(1, adults - 1))}
            >-</button>
            <strong style={{ fontSize: '16px' }}>{adults}</strong>
            <button 
              className="btn-header-outline" 
              style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
              onClick={() => setAdults(adults + 1)}
            >+</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Children</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ages 0 - 17</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              className="btn-header-outline" 
              style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
              onClick={() => handleChildrenCountChange(children - 1)}
            >-</button>
            <strong style={{ fontSize: '16px' }}>{children}</strong>
            <button 
              className="btn-header-outline" 
              style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
              onClick={() => handleChildrenCountChange(children + 1)}
            >+</button>
          </div>
        </div>

        {children > 0 && (
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Specify Age of Children:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {childAges.map((age, i) => (
                <select 
                  key={i}
                  className="search-cell-select"
                  value={age}
                  onChange={(e) => {
                    const updated = [...childAges];
                    updated[i] = parseInt(e.target.value);
                    setChildAges(updated);
                  }}
                >
                  {[...Array(18).keys()].map(a => (
                    <option key={a} value={a}>{a} yrs old</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-booking-primary" style={{ flex: 1 }} onClick={handleSave}>
            Apply Guests
          </button>
          <button className="btn-header-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function SwapModal({ isOpen, onClose, swapTarget, onApplySwap }) {
  if (!isOpen || !swapTarget) return null;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [swapTarget]);

  async function loadOptions() {
    setLoading(true);
    try {
      if (swapTarget.type === 'flight') {
        const from = swapTarget.param === 'outbound' ? 'BLR' : 'HND';
        const data = await fetchFlights({ from });
        if (data.success && data.flights) setOptions(data.flights.slice(0, 6));
      } else {
        const data = await fetchHotels(swapTarget.param || 'Tokyo');
        if (data.success && data.hotels) setOptions(data.hotels.slice(0, 6));
      }
    } catch (err) {
      console.error('Swap load error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-window" style={{ maxWidth: '600px' }}>
        <h3 className="modal-title">
          Swap {swapTarget.type === 'flight' ? 'Flight' : 'Hotel Accommodation'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Choose a valid alternative from catalog. Schedule buffers and room capacities will automatically re-verify.
        </p>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>Fetching alternative options...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
            {options.map((opt, i) => {
              const name = opt.name || `${opt.airline} (${opt.flight_number})`;
              const price = opt.price_per_seat ? (opt.price_per_seat.amount * 3) : ((opt.stars * 7000) * 6);
              const delta = price - 45000;
              const deltaStr = delta >= 0 ? `+₹${delta.toLocaleString()}` : `-₹${Math.abs(delta).toLocaleString()}`;
              const deltaColor = delta >= 0 ? 'var(--booking-blue-light)' : 'var(--green-score)';

              return (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid var(--border-gray)', borderRadius: '6px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px' }}>{name}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {opt.city || opt.airline} · {opt.stars ? `${opt.stars} Stars` : 'Direct Flight'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800 }}>₹{price.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: deltaColor }}>{deltaStr}</div>
                    </div>
                    <button 
                      className="btn-booking-primary"
                      onClick={() => onApplySwap(swapTarget.type, opt, name, price)}
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button className="btn-header-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmedModal({ isOpen, onClose, refCode, onViewReservations }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-window" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px auto' }}>
          ✓
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
          Journey Confirmed!
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Your entire package (flights, certified accommodations, airport transfers, and attraction passes) has been reserved.
        </p>
        
        <div style={{ background: '#f8fafc', border: '2px dashed var(--booking-blue-light)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Official 10-Digit Reservation Code
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '4px', color: 'var(--booking-blue)', margin: '6px 0', fontFamily: 'monospace' }}>
            {refCode}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
            🔒 INVENTORY LOCK ACTIVE · RECORD SAVED TO DATA/RESERVATIONS.JSON
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn-booking-primary"
            style={{ width: '100%', padding: '12px' }}
            onClick={onViewReservations}
          >
            View in My Reservations →
          </button>
          <button 
            className="btn-header-outline"
            style={{ width: '100%' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

