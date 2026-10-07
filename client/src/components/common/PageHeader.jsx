import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PageHeader = ({
  title,
  subtitle,
  actions,
  badge,
  backButton = false,
  backTo,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className={`page-header ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}
    >
      <div style={{ flex: 1, minWidth: '260px' }}>
        {backButton && (
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--color-slate-500)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '0.5rem',
              padding: '0'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h1 className="heading-page">
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p style={{ marginTop: '0.35rem', fontSize: '0.925rem', color: 'var(--color-slate-600)', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
