import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import RatingStars from './RatingStars';

/**
 * Rating Summary Component
 * Renders verified MongoDB aggregation ratings and distribution breakdown bars.
 */
export const RatingSummary = ({
  averageRating = 0,
  totalReviews = 0,
  distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
}) => {
  const roundedAverage = Number(averageRating || 0).toFixed(1);

  if (totalReviews === 0) {
    return (
      <div
        style={{
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#f8fafc',
          border: '1px dashed var(--color-slate-200)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--color-slate-400)'
          }}
        >
          <MessageSquare size={20} />
        </div>
        <strong style={{ fontSize: '0.95rem', color: 'var(--color-slate-700)' }}>
          No reviews yet
        </strong>
        <p style={{ fontSize: '0.825rem', color: 'var(--color-slate-500)', margin: 0, maxWidth: '280px' }}>
          Complete a transaction to start building your verified community reputation.
        </p>
      </div>
    );
  }

  const starLevels = [5, 4, 3, 2, 1];

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-slate-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
      className="rating-summary-card"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-slate-100)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-slate-900)', lineHeight: 1 }}>
            {roundedAverage}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate-400)' }}>
            / 5.0
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <RatingStars rating={Math.round(averageRating)} size={18} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 600 }}>
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>

      {/* Distribution Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {starLevels.map((stars) => {
          const count = distribution[stars] || 0;
          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

          return (
            <div
              key={stars}
              style={{
                display: 'grid',
                gridTemplateColumns: '45px 1fr 35px',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--color-slate-700)' }}>
                <span>{stars}</span>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
              </div>

              <div
                style={{
                  height: '8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: percentage > 0 ? '#f59e0b' : 'transparent',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease-out'
                  }}
                  title={`${count} reviews (${percentage}%)`}
                />
              </div>

              <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-slate-500)' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSummary;
