import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FormField = ({
  label,
  id,
  required = false,
  error,
  hint,
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className={`form-field ${className}`} style={style}>
      {label && (
        <label
          htmlFor={id}
          className={`form-label ${required ? 'form-label-required' : ''}`}
        >
          {label}
        </label>
      )}

      {children}

      {error ? (
        <div className="form-error" role="alert">
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div className="form-hint">{hint}</div>
      ) : null}
    </div>
  );
};

export default FormField;
