import React, { useState, useEffect } from 'react';

export default function SwapModal({ isOpen, onClose, swapType, currentItemId, onSelectSwap }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/swap-options?type=${swapType}&id=${currentItemId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.options) {
          setOptions(data.options);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load swap options:', err);
        setLoading(false);
      });
  }, [isOpen, swapType, currentItemId]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>
            Swap {swapType === 'hotel' ? 'Hotel' : swapType === 'flight' ? 'Flight' : 'Attraction'}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Calculating valid alternatives & price deltas...
            </div>
          ) : options.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No alternative {swapType}s found matching constraint rules.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {options.map((opt) => (
                <div
                  key={opt.id}
                  style={{
                    background: '#FAF7F2',
                    border: '1px solid #EAE5DF',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '15px', display: 'block', color: 'var(--text-dark)' }}>
                      {opt.name || opt.airline} {opt.stars ? '★'.repeat(opt.stars) : ''}
                    </strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {opt.details || opt.description}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: opt.delta > 0 ? '#FDF0EE' : '#EBF5EE',
                          color: opt.delta > 0 ? '#D9534F' : '#1B6B3A',
                        }}
                      >
                        {opt.delta > 0 ? `+₹${opt.delta.toLocaleString('en-IN')}` : opt.delta < 0 ? `-₹${Math.abs(opt.delta).toLocaleString('en-IN')}` : 'Same Price'}
                      </span>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => {
                        onSelectSwap(opt);
                        onClose();
                      }}
                    >
                      Choose ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

