import React from 'react';
import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

export const ImpactSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="240px" height="32px" />
          <Skeleton width="380px" height="18px" />
        </div>
        <Skeleton width="140px" height="40px" borderRadius="var(--radius-md)" />
      </div>

      {/* Hero Banner Skeleton */}
      <Card style={{ padding: '2rem' }}>
        <Skeleton width="60%" height="24px" style={{ marginBottom: '1rem' }} />
        <Skeleton width="40%" height="48px" style={{ marginBottom: '1rem' }} />
        <Skeleton width="80%" height="16px" />
      </Card>

      {/* Stat Cards Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton width="40px" height="40px" borderRadius="var(--radius-sm)" />
            <Skeleton width="80px" height="32px" />
            <Skeleton width="120px" height="16px" />
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card style={{ padding: '2rem' }}>
        <Skeleton width="200px" height="24px" style={{ marginBottom: '1.5rem' }} />
        <Skeleton width="100%" height="220px" borderRadius="var(--radius-md)" />
      </Card>
    </div>
  );
};

export default ImpactSkeleton;
