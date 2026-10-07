import React from 'react';

export const Input = ({
  label,
  id,
  name,
  type = 'text',
  error,
  helperText,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="input-field"
        style={error ? { borderColor: 'var(--color-danger)' } : {}}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
      {!error && helperText && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
