import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  PackageCheck
} from 'lucide-react';
import Badge from '../common/Badge';

export const RequestStatusBadge = ({ status = 'PENDING', size = 'md', className = '' }) => {
  const normalized = (status || 'PENDING').toUpperCase();

  const getConfig = () => {
    switch (normalized) {
      case 'ACCEPTED':
        return {
          variant: 'success',
          icon: CheckCircle2,
          label: 'Accepted'
        };
      case 'DECLINED':
        return {
          variant: 'danger',
          icon: XCircle,
          label: 'Declined'
        };
      case 'CANCELLED':
        return {
          variant: 'neutral',
          icon: Ban,
          label: 'Cancelled'
        };
      case 'COMPLETED':
        return {
          variant: 'info',
          icon: PackageCheck,
          label: 'Completed'
        };
      case 'PENDING':
      default:
        return {
          variant: 'warning',
          icon: Clock,
          label: 'Pending Review'
        };
    }
  };

  const { variant, icon: Icon, label } = getConfig();

  return (
    <Badge
      variant={variant}
      size={size}
      className={`request-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}
    >
      <Icon size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </Badge>
  );
};

export default RequestStatusBadge;
