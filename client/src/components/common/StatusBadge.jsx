import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Package,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  ArrowRightCircle
} from 'lucide-react';

export const StatusBadge = ({ status = 'PENDING', size = 'md', className = '' }) => {
  const norm = (status || '').toUpperCase().trim();

  let config = {
    label: norm.replace(/_/g, ' '),
    variant: 'neutral',
    icon: Clock,
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1'
  };

  switch (norm) {
    case 'ACTIVE':
    case 'AVAILABLE':
    case 'COMPLETED':
    case 'RESOLVED':
    case 'ACCEPTED':
      config = {
        label: norm === 'ACCEPTED' ? 'Accepted' : norm === 'COMPLETED' ? 'Completed' : norm === 'AVAILABLE' ? 'Available' : norm,
        variant: 'success',
        icon: CheckCircle2,
        bg: '#ecfdf5',
        text: '#047857',
        border: '#a7f3d0'
      };
      break;

    case 'PENDING':
    case 'PENDING_HANDOVER':
    case 'HANDOVER_SCHEDULED':
    case 'RETURN_PENDING':
      config = {
        label: norm === 'HANDOVER_SCHEDULED' ? 'Handover Scheduled' : norm === 'RETURN_PENDING' ? 'Return Pending' : 'Pending',
        variant: 'warning',
        icon: norm.includes('SCHEDULED') ? Calendar : Clock,
        bg: '#fffbeb',
        text: '#b45309',
        border: '#fde68a'
      };
      break;

    case 'HANDED_OVER':
    case 'RETURNED':
    case 'IN_PROGRESS':
      config = {
        label: norm === 'HANDED_OVER' ? 'Handed Over' : norm === 'RETURNED' ? 'Returned' : 'In Progress',
        variant: 'info',
        icon: norm === 'RETURNED' ? RotateCcw : ArrowRightCircle,
        bg: '#eff6ff',
        text: '#1d4ed8',
        border: '#bfdbfe'
      };
      break;

    case 'DECLINED':
    case 'CANCELLED':
    case 'REJECTED':
    case 'SUSPENDED':
    case 'REMOVED':
      config = {
        label: norm.charAt(0) + norm.slice(1).toLowerCase(),
        variant: 'danger',
        icon: XCircle,
        bg: '#fef2f2',
        text: '#b91c1c',
        border: '#fecaca'
      };
      break;

    default:
      config = {
        label: norm.replace(/_/g, ' '),
        variant: 'neutral',
        icon: Package,
        bg: '#f8fafc',
        text: '#475569',
        border: '#e2e8f0'
      };
      break;
  }

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? '4px' : '6px',
        padding: isSm ? '2px 7px' : '3px 10px',
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontSize: isSm ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        lineHeight: 1.3,
        whiteSpace: 'nowrap'
      }}
    >
      <Icon size={isSm ? 11 : 13} style={{ flexShrink: 0 }} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
