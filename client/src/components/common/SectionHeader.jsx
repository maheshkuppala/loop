import React from 'react';

export const SectionHeader = ({
  title,
  subtitle,
  actions,
  badge,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`section-header ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '1rem',
        ...style
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="heading-section">{title}</h2>
          {badge}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
