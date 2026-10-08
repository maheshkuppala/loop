import React from 'react';

export const LooopSkeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm, 8px)',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`looop-skeleton-green ${className}`}
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  );
};

export const LooopCardSkeleton = () => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--color-slate-200, #e2e8f0)',
      borderRadius: 'var(--radius-lg, 16px)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <LooopSkeleton height="180px" borderRadius="var(--radius-md, 12px)" />
      <LooopSkeleton width="40%" height="14px" />
      <LooopSkeleton width="85%" height="20px" />
      <LooopSkeleton width="60%" height="14px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <LooopSkeleton width="30%" height="24px" borderRadius="var(--radius-full, 9999px)" />
        <LooopSkeleton width="20%" height="24px" />
      </div>
    </div>
  );
};

export const LooopImageSkeleton = ({ width = '100%', height = '200px', borderRadius = 'var(--radius-md, 12px)' }) => {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <LooopSkeleton
        width="100%"
        height="100%"
        borderRadius={borderRadius}
      />
    </div>
  );
};

export const LooopStatSkeleton = () => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--color-slate-200, #e2e8f0)',
      borderRadius: 'var(--radius-lg, 16px)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <LooopSkeleton width="60%" height="14px" />
      <LooopSkeleton width="40%" height="28px" />
      <LooopSkeleton width="80%" height="12px" />
    </div>
  );
};

export const LooopTableSkeleton = ({ rows = 5 }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--color-slate-200, #e2e8f0)',
      borderRadius: 'var(--radius-lg, 16px)',
      overflow: 'hidden'
    }}>
      {/* Header row */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-slate-200, #e2e8f0)', display: 'flex', gap: '16px' }}>
        <LooopSkeleton width="20%" height="16px" />
        <LooopSkeleton width="25%" height="16px" />
        <LooopSkeleton width="20%" height="16px" />
        <LooopSkeleton width="15%" height="16px" />
        <LooopSkeleton width="10%" height="16px" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ padding: '14px 20px', borderBottom: i < rows - 1 ? '1px solid var(--color-slate-100, #f1f5f9)' : 'none', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <LooopSkeleton width="20%" height="14px" />
          <LooopSkeleton width="25%" height="14px" />
          <LooopSkeleton width="20%" height="14px" />
          <LooopSkeleton width="15%" height="24px" borderRadius="var(--radius-full, 9999px)" />
          <LooopSkeleton width="10%" height="14px" />
        </div>
      ))}
    </div>
  );
};

export default LooopSkeleton;
