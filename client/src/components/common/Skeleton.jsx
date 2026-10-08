import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`looop-skeleton-green ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-slate-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <Skeleton height="180px" borderRadius="var(--radius-md)" />
      <Skeleton width="40%" height="16px" />
      <Skeleton width="90%" height="22px" />
      <Skeleton width="60%" height="16px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <Skeleton width="30%" height="24px" borderRadius="var(--radius-full)" />
        <Skeleton width="20%" height="24px" />
      </div>
    </div>
  );
};

export default Skeleton;
