import React from 'react';

export default function GuestModal({ isOpen, onClose, searchParams, setSearchParams }) {
  if (!isOpen) return null;

  const updateAdults = (delta) => {
    setSearchParams((prev) => ({
      ...prev,
      adults: Math.max(1, Math.min(9, prev.adults + delta)),
    }));
  };

  const updateChildren = (delta) => {
    setSearchParams((prev) => {
      const newCount = Math.max(0, Math.min(6, prev.children + delta));
      let newAges = [...prev.childAges];
      if (newCount > prev.children) {
        newAges.push(6);
      } else if (newCount < prev.children) {
        newAges.pop();
      }
      return {
        ...prev,
        children: newCount,
        childAges: newAges,
      };
    });
  };

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
            Guests & Occupancy
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ padding: '20px 0', display: 'grid', gap: '16px' }}>
          {/* Adults */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>Adults</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Age 18+</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="btn-secondary-sm" onClick={() => updateAdults(-1)}>-</button>
              <strong style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{searchParams.adults}</strong>
              <button className="btn-secondary-sm" onClick={() => updateAdults(1)}>+</button>
            </div>
          </div>

          {/* Children */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>Children</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Age 0-17</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="btn-secondary-sm" onClick={() => updateChildren(-1)}>-</button>
              <strong style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{searchParams.children}</strong>
              <button className="btn-secondary-sm" onClick={() => updateChildren(1)}>+</button>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #EAE5DF', paddingTop: '12px', textAlign: 'right' }}>
          <button className="btn-primary" style={{ padding: '8px 20px' }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

