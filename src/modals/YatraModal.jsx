import React, { useState } from 'react';

export default function YatraModal({ isOpen, onClose, selectedCircuit, onConfirmYatra }) {
  const [seniors, setSeniors] = useState(2);
  const [heliUpgrade, setHeliUpgrade] = useState(true);
  const [palaceUpgrade, setPalaceUpgrade] = useState(false);
  const [diet, setDiet] = useState('pure-sattvic');
  const [wheelchair, setWheelchair] = useState(true);
  const [gotraPuja, setGotraPuja] = useState(false);
  const [sevak, setSevak] = useState(false);
  const [parentNames, setParentNames] = useState('');
  const [travelDate, setTravelDate] = useState('2027-04-15');
  const [healthNotes, setHealthNotes] = useState('');

  if (!isOpen || !selectedCircuit) return null;

  // Base price calculation
  const basePricePerPerson = (selectedCircuit.price || 185000) / 2;
  let total = basePricePerPerson * seniors;
  if (heliUpgrade) total += 24000 * seniors;
  if (palaceUpgrade) total += 14000;
  if (gotraPuja) total += 2500;
  if (sevak) total += 4500;

  const handleConfirm = () => {
    onConfirmYatra({
      circuitName: selectedCircuit.name,
      seniors,
      heliUpgrade,
      palaceUpgrade,
      diet,
      wheelchair,
      gotraPuja,
      sevak,
      parentNames: parentNames || 'Ramesh & Sunita Sharma',
      travelDate,
      healthNotes,
      total,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
              Customize Sacred Tirth Yatra for Parents
            </h3>
            <span style={{ fontSize: '12px', color: '#C28B51', fontWeight: 600 }}>
              {selectedCircuit.name}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gap: '16px', padding: '16px 0' }}>
          {/* Senior Count */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              1. Number of Senior Travelers:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`btn-secondary-sm ${seniors === num ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderColor: seniors === num ? '#C28B51' : '#EAE5DF',
                    background: seniors === num ? '#FAF5EE' : '#FFF',
                    fontWeight: 700,
                  }}
                  onClick={() => setSeniors(num)}
                >
                  {num} Seniors
                </button>
              ))}
            </div>
          </div>

          {/* Helicopter Upgrade */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              2. Aviation & Helipad Access:
            </label>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid #EAE5DF',
                borderRadius: '8px',
                background: heliUpgrade ? '#FAF7F2' : '#FFF',
              }}
            >
              <div>
                <strong>🚁 Helicopter Shuttle to Sanctum</strong>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Zero-trek priority landing directly at temple helipad
                </p>
              </div>
              <input
                type="checkbox"
                checked={heliUpgrade}
                onChange={(e) => setHeliUpgrade(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
            </div>
          </div>

          {/* Diet Preferences */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              3. Sacred Diet & Temple Meals:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'pure-sattvic', label: 'Pure Sattvic', sub: 'Temple Ghee' },
                { id: 'jain-sattvic', label: 'Jain Sattvic', sub: 'Zero Roots' },
                { id: 'diabetic-care', label: 'Diabetic Care', sub: 'Low Sodium' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className="btn-secondary-sm"
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    borderColor: diet === d.id ? '#C28B51' : '#EAE5DF',
                    background: diet === d.id ? '#FAF5EE' : '#FFF',
                  }}
                  onClick={() => setDiet(d.id)}
                >
                  <strong style={{ fontSize: '12px', display: 'block' }}>{d.label}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Elder Care Add-ons */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              4. Elder Care & Sacred Add-ons:
            </label>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #EAE5DF', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px' }}>♿ Guaranteed Wheelchair & Buggy (All Gates)</span>
                <input type="checkbox" checked={wheelchair} onChange={(e) => setWheelchair(e.target.checked)} />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #EAE5DF', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px' }}>🕉️ Special Sankalp Puja in Family Gotra (+₹2,500)</span>
                <input type="checkbox" checked={gotraPuja} onChange={(e) => setGotraPuja(e.target.checked)} />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #EAE5DF', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px' }}>🤝 24/7 Personal Sevak / Language Escort (+₹4,500)</span>
                <input type="checkbox" checked={sevak} onChange={(e) => setSevak(e.target.checked)} />
              </label>
            </div>
          </div>

          {/* Parents' Details & Health Notes */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              5. Parents' Full Names & Travel Date:
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Parents' Full Names (e.g. Ramesh & Sunita Sharma)"
                value={parentNames}
                onChange={(e) => setParentNames(e.target.value)}
                className="search-cell-input"
                style={{ flex: 1.5 }}
              />
              <input
                type="date"
                value={travelDate}
                min="2027-04-01"
                max="2027-04-20"
                onChange={(e) => setTravelDate(e.target.value)}
                className="search-cell-input"
                style={{ flex: 1 }}
              />
            </div>
            <textarea
              placeholder="Any health notes, knee trouble, dietary restrictions, wheelchair preferences..."
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              className="search-cell-input"
              rows={2}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #EAE5DF', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Guaranteed Custom Yatra:</span>
            <strong style={{ fontSize: '22px', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)' }}>
              ₹{total.toLocaleString('en-IN')}
            </strong>
          </div>
          <button className="btn-primary" style={{ padding: '11px 20px' }} onClick={handleConfirm}>
            Confirm Custom Tirth Yatra & Generate 10-Digit Pass →
          </button>
        </div>
      </div>
    </div>
  );
}

