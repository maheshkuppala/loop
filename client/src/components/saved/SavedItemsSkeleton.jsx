import React from 'react';

/**
 * SavedItemsSkeleton
 * Shimmer placeholder skeleton for the Saved Items page during API fetch.
 */
export const SavedItemsSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            className="skeleton"
            style={{ width: '220px', height: '32px', borderRadius: 'var(--radius-sm)' }}
          />
          <div
            className="skeleton"
            style={{ width: '380px', height: '18px', borderRadius: 'var(--radius-xs)' }}
          />
        </div>
        <div
          className="skeleton"
          style={{ width: '130px', height: '40px', borderRadius: 'var(--radius-md)' }}
        />
      </div>

      {/* Toolbar Skeleton */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-slate-200)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div className="skeleton" style={{ flex: 1, minWidth: '240px', height: '42px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ width: '140px', height: '42px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ width: '140px', height: '42px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ width: '150px', height: '42px', borderRadius: 'var(--radius-md)' }} />
      </div>

      {/* Grid of Item Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-slate-200)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '360px'
            }}
          >
            {/* Image Shimmer */}
            <div className="skeleton" style={{ width: '100%', height: '200px' }} />
            {/* Content Shimmer */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div className="skeleton" style={{ width: '85%', height: '20px', borderRadius: 'var(--radius-xs)' }} />
              <div className="skeleton" style={{ width: '50%', height: '14px', borderRadius: 'var(--radius-xs)' }} />
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: '70px', height: '14px', borderRadius: 'var(--radius-xs)' }} />
                </div>
                <div className="skeleton" style={{ width: '40px', height: '14px', borderRadius: 'var(--radius-xs)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedItemsSkeleton;
