import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are currently no items matching your criteria in this section.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`empty-state-card ${className}`}
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-slate-300)',
        maxWidth: '540px',
        margin: '2rem auto'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.925rem', color: 'var(--color-slate-600)', lineHeight: 1.6, marginBottom: actionLabel ? '1.5rem' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
