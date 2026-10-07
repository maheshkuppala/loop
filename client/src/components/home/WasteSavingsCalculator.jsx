import React, { useState } from 'react';
import { Calculator, Sparkles, RefreshCw, Leaf, Droplets, TreePine, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export const WasteSavingsCalculator = () => {
  const [category, setCategory] = useState('electronics');
  const [itemCount, setItemCount] = useState(2);

  const categoryImpactFactors = {
    electronics: { label: 'Electronics & Gadgets', wasteKg: 4.5, co2Kg: 18.2, waterL: 420 },
    books: { label: 'Books & Literature', wasteKg: 1.2, co2Kg: 2.8, waterL: 85 },
    clothes: { label: 'Clothes & Apparel', wasteKg: 2.1, co2Kg: 9.5, waterL: 650 },
    furniture: { label: 'Furniture & Living', wasteKg: 14.0, co2Kg: 45.0, waterL: 900 },
    tools: { label: 'Tools & DIY', wasteKg: 5.8, co2Kg: 22.0, waterL: 310 }
  };

  const selected = categoryImpactFactors[category] || categoryImpactFactors.electronics;

  const totalWaste = (selected.wasteKg * itemCount).toFixed(1);
  const totalCo2 = (selected.co2Kg * itemCount).toFixed(1);
  const totalWater = Math.round(selected.waterL * itemCount);
  const treesEquivalent = (totalCo2 * 0.05).toFixed(1);

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        backdropFilter: 'blur(12px)',
        marginTop: '3.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Calculator size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Interactive Waste & Impact Calculator
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
            Estimate environmental waste prevented by giving away or reusing your items.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}
      >
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a7f3d0', display: 'block', marginBottom: '0.4rem' }}>
              Select Item Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                color: '#ffffff',
                fontSize: '0.925rem',
                outline: 'none'
              }}
            >
              {Object.entries(categoryImpactFactors).map(([key, val]) => (
                <option key={key} value={key} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a7f3d0' }}>
                Number of Items Reused:
              </label>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#10b981',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* Results Metrics Display */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}
        >
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <Leaf size={14} /> Solid Waste Prevented
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>
              {totalWaste} kg
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <Sparkles size={14} /> CO₂ Emissions Saved
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>
              {totalCo2} kg
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <Droplets size={14} /> Water Saved
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>
              {totalWater.toLocaleString()} L
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <TreePine size={14} /> Trees Equivalent
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>
              {treesEquivalent} 🌲
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteSavingsCalculator;
