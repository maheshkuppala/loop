import React from 'react';
import { RotateCcw } from 'lucide-react';

export const AdminFilterBar = ({ children, onReset, hasActiveFilters = false }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
        {children}
      </div>

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-sm)',
            color: '#94a3b8',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#64748b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = '#334155';
          }}
        >
          <RotateCcw size={13} />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};

export default AdminFilterBar;
