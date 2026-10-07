import React from 'react';

export const StatusBadge = ({ status = 'ACTIVE' }) => {
  const norm = (status || '').toUpperCase().trim();

  let bg = '#334155';
  let color = '#f8fafc';
  let dotColor = '#94a3b8';

  if (['ACTIVE', 'AVAILABLE', 'COMPLETED', 'ACCEPTED', 'RESOLVED'].includes(norm)) {
    bg = 'rgba(16, 185, 129, 0.15)';
    color = '#34d399';
    dotColor = '#10b981';
  } else if (['PENDING', 'PENDING_HANDOVER', 'HANDOVER_SCHEDULED', 'REVIEWED', 'RETURN_PENDING'].includes(norm)) {
    bg = 'rgba(245, 158, 11, 0.15)';
    color = '#fbbf24';
    dotColor = '#f59e0b';
  } else if (['SUSPENDED', 'REMOVED', 'CANCELLED', 'DECLINED', 'DISMISSED', 'INACTIVE'].includes(norm)) {
    bg = 'rgba(239, 68, 68, 0.15)';
    color = '#f87171';
    dotColor = '#ef4444';
  } else if (['HANDED_OVER', 'RETURNED', 'BORROW', 'FREE'].includes(norm)) {
    bg = 'rgba(56, 189, 248, 0.15)';
    color = '#38bdf8';
    dotColor = '#0ea5e9';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        fontSize: '0.725rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor
        }}
      />
      <span>{norm.replace(/_/g, ' ')}</span>
    </span>
  );
};

export default StatusBadge;
