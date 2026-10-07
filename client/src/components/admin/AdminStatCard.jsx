import React from 'react';
import { Link } from 'react-router-dom';

export const AdminStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'var(--color-primary-400)',
  alert = false,
  link = null,
  isLoading = false
}) => {
  const content = (
    <div
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 'var(--radius-md)',
        border: alert ? '1px solid var(--color-danger)' : '1px solid #334155',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = alert ? 'var(--color-danger)' : color;
        }
      }}
      onMouseLeave={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.borderColor = alert ? 'var(--color-danger)' : '#334155';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={20} color={color} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
          {isLoading ? '...' : (value !== undefined && value !== null ? value : 0)}
        </span>
      </div>

      {subtitle && (
        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: alert ? '#f87171' : '#64748b' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default AdminStatCard;
