import React from 'react';
import Skeleton, { CardSkeleton } from '../common/Skeleton';

export const BrowseSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Discovery Banner Skeleton */}
      <Skeleton height="70px" borderRadius="var(--radius-lg)" />
      <Skeleton height="110px" borderRadius="var(--radius-xl)" />

      {/* Category Bar Skeleton */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} width="130px" height="38px" borderRadius="var(--radius-full)" />
        ))}
      </div>

      {/* Main Layout Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '1.75rem',
          alignItems: 'start'
        }}
        className="browse-skeleton-layout"
      >
        {/* Left Filter Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="360px" borderRadius="var(--radius-xl)" />
          <Skeleton height="180px" borderRadius="var(--radius-xl)" />
        </div>

        {/* Right Cards Grid Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="180px" height="24px" />
            <Skeleton width="140px" height="36px" borderRadius="var(--radius-md)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .browse-skeleton-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseSkeleton;
