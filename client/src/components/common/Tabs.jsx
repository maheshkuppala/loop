import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  className = ''
}) => {
  return (
    <div
      className={`tabs-nav ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'pills' ? '8px' : '24px',
        borderBottom: variant === 'underline' ? '1px solid var(--color-slate-200)' : 'none',
        overflowX: 'auto',
        paddingBottom: variant === 'underline' ? '0' : '4px',
        scrollbarWidth: 'none'
      }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                padding: '10px 4px',
                fontSize: '0.925rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary-700)' : 'var(--color-slate-500)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary-100)' : 'var(--color-slate-100)',
                    color: isActive ? 'var(--color-primary-800)' : 'var(--color-slate-600)',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        // Pill variant
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              background: isActive
                ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))'
                : 'var(--color-slate-100)',
              color: isActive ? '#ffffff' : 'var(--color-slate-700)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            {Icon && <Icon size={15} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-slate-200)',
                  color: isActive ? '#ffffff' : 'var(--color-slate-700)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
