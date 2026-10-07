import React from 'react';
import { Star } from 'lucide-react';

export const Rating = ({ score = 5.0, count = 0, size = 15, showCount = true, className = '' }) => {
  return (
    <div
      className={`rating-container ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
        <Star size={size} fill="#f59e0b" color="#f59e0b" />
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
        {Number(score).toFixed(1)}
      </span>
      {showCount && count > 0 && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default Rating;
