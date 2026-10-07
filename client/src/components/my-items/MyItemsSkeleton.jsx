import React from 'react';
import Card from '../common/Card';

export const MyItemsSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Summary Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-slate-200)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '90px', height: '14px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
            </div>
            <div style={{ width: '45px', height: '28px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
          </div>
        ))}
      </div>

      {/* 2. Filter Tabs Skeleton */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              width: '80px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#e2e8f0'
            }}
            className="animate-pulse"
          />
        ))}
      </div>

      {/* 3. Search & Filter Toolbar Skeleton */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-slate-200)',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
        <div style={{ width: '130px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
        <div style={{ width: '120px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
      </div>

      {/* 4. Item Cards List Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-slate-200)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-md)', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ width: '120px', height: '12px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
                <div style={{ width: '70%', height: '20px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '60px', height: '16px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
                  <div style={{ width: '70px', height: '16px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div style={{ width: '100px', height: '14px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '60px', height: '30px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
                <div style={{ width: '60px', height: '30px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
                <div style={{ width: '90px', height: '30px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyItemsSkeleton;
