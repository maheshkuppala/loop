import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="input-field"
          style={{
            appearance: 'none',
            paddingRight: '36px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            ...(error ? { borderColor: 'var(--color-danger)' } : {})
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          style={{
            position: 'absolute',
            right: '12px',
            pointerEvents: 'none',
            color: 'var(--color-slate-400)'
          }}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
      {!error && helperText && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Select;
