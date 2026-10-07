import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info
};

export const Alert = ({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
  ...props
}) => {
  const Icon = icons[variant] || Info;

  return (
    <div className={`alert alert-${variant} ${className}`} role="alert" {...props}>
      <Icon size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.7
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
