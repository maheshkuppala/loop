import React from 'react';
import Skeleton, { CardSkeleton } from '../common/Skeleton';

export const ItemDetailSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Breadcrumb Skeleton */}
      <Skeleton width="280px" height="20px" />

      {/* Main Two-Column Layout Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '2.5rem',
          alignItems: 'start'
        }}
        className="item-skeleton-grid"
      >
        {/* Left: Gallery Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton height="400px" borderRadius="var(--radius-xl)" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="72px" height="72px" borderRadius="var(--radius-md)" />
            <Skeleton width="72px" height="72px" borderRadius="var(--radius-md)" />
            <Skeleton width="72px" height="72px" borderRadius="var(--radius-md)" />
          </div>
        </div>

        {/* Right: Details & Actions Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton width="90px" height="24px" borderRadius="var(--radius-full)" />
            <Skeleton width="110px" height="24px" borderRadius="var(--radius-full)" />
          </div>

          <Skeleton width="85%" height="36px" />
          <Skeleton width="60%" height="20px" />

          {/* Action buttons skeleton */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Skeleton width="200px" height="46px" borderRadius="var(--radius-md)" />
            <Skeleton width="110px" height="46px" borderRadius="var(--radius-md)" />
          </div>

          <Skeleton height="100px" borderRadius="var(--radius-lg)" style={{ marginTop: '12px' }} />

          <Skeleton height="140px" borderRadius="var(--radius-xl)" />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .item-skeleton-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ItemDetailSkeleton;
