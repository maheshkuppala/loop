import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search items by keyword, brand, or subject...',
  className = '',
  size = 'md'
}) => {
  return (
    <div
      className={`search-input-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Search
        size={size === 'lg' ? 20 : 17}
        style={{
          position: 'absolute',
          left: size === 'lg' ? '14px' : '12px',
          color: 'var(--color-slate-400)',
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        style={{
          paddingLeft: size === 'lg' ? '42px' : '38px',
          paddingRight: value ? '38px' : '14px',
          paddingTop: size === 'lg' ? '12px' : '8px',
          paddingBottom: size === 'lg' ? '12px' : '8px',
          fontSize: size === 'lg' ? '1rem' : '0.925rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-slate-400)'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
