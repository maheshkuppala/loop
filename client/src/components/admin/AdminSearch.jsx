import React from 'react';
import { Search, X } from 'lucide-react';

export const AdminSearch = ({
  value = '',
  onChange,
  placeholder = 'Search records...',
  style = {}
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minWidth: '240px',
        ...style
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          color: '#64748b',
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 36px 8px 36px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 'var(--radius-sm)',
          color: '#f8fafc',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color var(--transition-fast)'
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary-400)')}
        onBlur={(e) => (e.target.style.borderColor = '#334155')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default AdminSearch;
