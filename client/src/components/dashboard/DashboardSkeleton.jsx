import React from 'react';
import Skeleton, { CardSkeleton } from '../common/Skeleton';

export const DashboardSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Skeleton */}
      <Skeleton height="220px" borderRadius="var(--radius-xl)" />

      {/* Quick Action Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <Skeleton height="150px" borderRadius="var(--radius-lg)" />
        <Skeleton height="150px" borderRadius="var(--radius-lg)" />
        <Skeleton height="150px" borderRadius="var(--radius-lg)" />
      </div>

      {/* Category Chips Skeleton */}
      <div>
        <Skeleton width="220px" height="24px" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} height="90px" borderRadius="var(--radius-lg)" />
          ))}
        </div>
      </div>

      {/* Items Near You Grid Skeleton */}
      <div>
        <Skeleton width="240px" height="26px" style={{ marginBottom: '1.25rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
