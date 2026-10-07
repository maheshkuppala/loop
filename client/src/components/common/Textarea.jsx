import React from 'react';

export const Textarea = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  helperText,
  maxLength,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-group ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label htmlFor={textareaId} className="input-label">
            {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </label>
        )}
        {maxLength && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className="input-field"
        style={{
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          ...(error ? { borderColor: 'var(--color-danger)' } : {})
        }}
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

export default Textarea;
