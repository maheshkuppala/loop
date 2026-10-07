import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Repeat,
  Clock,
  PackageCheck,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Bell,
  ArrowRight,
  UserCheck,
  Leaf,
  Trash2,
  Lock
} from 'lucide-react';

/**
 * Format relative timestamp without external libraries or fake dates
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 45) return 'Just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Type-specific styling and icon metadata
 */
const getTypeConfig = (type, category) => {
  switch (type) {
    case 'REQUEST_RECEIVED':
      return {
        icon: Inbox,
        bg: '#eff6ff',
        color: '#2563eb',
        borderColor: '#bfdbfe',
        categoryLabel: 'Request'
      };
    case 'REQUEST_ACCEPTED':
      return {
        icon: CheckCircle2,
        bg: '#f0fdf4',
        color: '#16a34a',
        borderColor: '#bbf7d0',
        categoryLabel: 'Accepted'
      };
    case 'REQUEST_DECLINED':
      return {
        icon: XCircle,
        bg: '#fef2f2',
        color: '#dc2626',
        borderColor: '#fecaca',
        categoryLabel: 'Declined'
      };
    case 'REQUEST_CANCELLED':
      return {
        icon: AlertCircle,
        bg: '#fffbeb',
        color: '#d97706',
        borderColor: '#fde68a',
        categoryLabel: 'Cancelled'
      };
    case 'TRANSACTION_CREATED':
    case 'HANDOVER_SCHEDULED':
      return {
        icon: Clock,
        bg: '#f0fdfa',
        color: '#0d9488',
        borderColor: '#99f6e4',
        categoryLabel: 'Handover'
      };
    case 'HANDOVER_CONFIRMED':
    case 'TRANSACTION_COMPLETED':
    case 'RETURN_CONFIRMED':
      return {
        icon: PackageCheck,
        bg: '#f0fdf4',
        color: '#059669',
        borderColor: '#a7f3d0',
        categoryLabel: 'Completed'
      };
    case 'RETURN_STARTED':
      return {
        icon: Repeat,
        bg: '#faf5ff',
        color: '#9333ea',
        borderColor: '#e9d5ff',
        categoryLabel: 'Return'
      };
    case 'NEW_MESSAGE':
      return {
        icon: MessageSquare,
        bg: '#eff6ff',
        color: '#3b82f6',
        borderColor: '#bfdbfe',
        categoryLabel: 'Message'
      };
    case 'WANTED_MATCH':
    case 'WANTED_RESPONSE':
      return {
        icon: Sparkles,
        bg: '#fefce8',
        color: '#ca8a04',
        borderColor: '#fef08a',
        categoryLabel: 'Match'
      };
    case 'SECURITY_ALERT':
      return {
        icon: ShieldAlert,
        bg: '#fef2f2',
        color: '#e11d48',
        borderColor: '#fecdd3',
        categoryLabel: 'Security'
      };
    case 'REPORT_UPDATE':
      return {
        icon: ShieldAlert,
        bg: '#fff1f2',
        color: '#be123c',
        borderColor: '#fecdd3',
        categoryLabel: 'Safety'
      };
    case 'IMPACT_MILESTONE':
      return {
        icon: Leaf,
        bg: '#ecfdf5',
        color: '#047857',
        borderColor: '#a7f3d0',
        categoryLabel: 'Impact'
      };
    default:
      return {
        icon: Bell,
        bg: '#f8fafc',
        color: '#64748b',
        borderColor: '#e2e8f0',
        categoryLabel: category || 'General'
      };
  }
};

/**
 * Determine deep-link route based on notification type and related entities
 */
export const getNotificationDestination = (notification) => {
  if (!notification) return null;

  if (notification.link) {
    return notification.link;
  }

  const {
    type,
    category,
    relatedEntityType,
    relatedEntityId,
    relatedRequest,
    relatedTransaction,
    relatedConversation,
    relatedItem
  } = notification;

  // 1. Transaction priority
  const txId = relatedTransaction?._id || relatedTransaction || (relatedEntityType === 'Transaction' ? relatedEntityId : null);
  if (['TRANSACTION_CREATED', 'HANDOVER_SCHEDULED', 'HANDOVER_CONFIRMED', 'RETURN_STARTED', 'RETURN_CONFIRMED', 'TRANSACTION_COMPLETED'].includes(type) && txId) {
    return `/transactions/${txId}`;
  }

  // 2. Request priority
  const reqId = relatedRequest?._id || relatedRequest || (relatedEntityType === 'Request' ? relatedEntityId : null);
  if (['REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_DECLINED', 'REQUEST_CANCELLED'].includes(type)) {
    if (txId) return `/transactions/${txId}`;
    if (reqId) return `/requests/${reqId}`;
    return '/requests';
  }

  // 3. Conversation priority
  const convId = relatedConversation?._id || relatedConversation || (relatedEntityType === 'Conversation' ? relatedEntityId : null);
  if (type === 'NEW_MESSAGE' && convId) {
    return `/messages/${convId}`;
  }

  // 4. Wanted Item priority
  if (['WANTED_MATCH', 'WANTED_RESPONSE'].includes(type) && relatedEntityId) {
    return `/wanted/${relatedEntityId}`;
  }

  // 5. Item priority
  const itemId = relatedItem?._id || relatedItem || (relatedEntityType === 'Item' ? relatedEntityId : null);
  if (['ITEM_UPDATED', 'ITEM_UNAVAILABLE'].includes(type) && itemId) {
    return `/items/${itemId}`;
  }

  // 6. Impact
  if (type === 'IMPACT_MILESTONE' || category === 'IMPACT') {
    return '/customer/impact';
  }

  // 7. Security or profile fallback
  if (type === 'SECURITY_ALERT' || category === 'ACCOUNT') {
    return '/profile';
  }

  return null;
};

export const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const {
    _id,
    id,
    type,
    category,
    title,
    message,
    isRead,
    createdAt,
    actor,
    relatedItem
  } = notification;

  const notifId = _id || id;
  const config = getTypeConfig(type, category);
  const IconComponent = config.icon;
  const timeDisplay = formatRelativeTime(createdAt);
  const destination = getNotificationDestination(notification);
  const isSecurity = category === 'ACCOUNT' || type === 'SECURITY_ALERT';

  const handleClick = (e) => {
    // If click was on dismiss button, don't navigate
    if (e.target.closest('.notif-dismiss-btn')) {
      return;
    }

    // Mark as read if currently unread
    if (!isRead && onMarkRead) {
      onMarkRead(notifId);
    }

    // Navigate to related entity if valid route exists
    if (destination) {
      navigate(destination);
    }
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    if (onDelete && !isSecurity) {
      onDelete(notifId);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
      aria-label={`${isRead ? '' : 'Unread notification: '}${title}. ${message}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: isRead ? '#ffffff' : '#f0fdf4',
        border: `1px solid ${isRead ? 'var(--color-slate-200)' : '#bbf7d0'}`,
        cursor: 'pointer',
        transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: isRead ? '0 1px 3px rgba(15, 23, 42, 0.04)' : '0 2px 8px rgba(16, 185, 129, 0.08)'
      }}
      className="looop-notification-card"
    >
      {/* Type-Specific Icon Container */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px'
        }}
      >
        <IconComponent size={20} />
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4
              style={{
                fontSize: '0.925rem',
                fontWeight: isRead ? 600 : 700,
                color: isRead ? 'var(--color-slate-800)' : 'var(--color-slate-900)',
                margin: 0
              }}
            >
              {title}
            </h4>

            {/* Category tag */}
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: config.bg,
                color: config.color,
                border: `1px solid ${config.borderColor}`,
                textTransform: 'uppercase'
              }}
            >
              {config.categoryLabel}
            </span>

            {actor && actor.name && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <UserCheck size={12} />
                <span>{actor.name}</span>
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: isRead ? 'var(--color-slate-400)' : '#059669',
              fontWeight: isRead ? 400 : 600,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {timeDisplay}
          </span>
        </div>

        <p
          style={{
            fontSize: '0.865rem',
            color: isRead ? 'var(--color-slate-600)' : 'var(--color-slate-700)',
            margin: '0 0 6px 0',
            lineHeight: 1.45,
            wordBreak: 'break-word'
          }}
        >
          {message}
        </p>

        {/* Optional Related Entity Badge/Preview */}
        {relatedItem && relatedItem.title && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isRead ? 'var(--color-slate-100)' : '#e6fcf5',
              fontSize: '0.75rem',
              color: isRead ? 'var(--color-slate-700)' : '#047857',
              fontWeight: 500
            }}
          >
            <span>Item: {relatedItem.title}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Unread indicator, dismiss button & deep link arrow */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          alignSelf: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isRead && (
            <span
              title="Unread notification"
              aria-label="Unread notification"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
              }}
            />
          )}

          {!isSecurity ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="notif-dismiss-btn"
              title="Dismiss notification"
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                color: 'var(--color-slate-400)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color var(--transition-fast)'
              }}
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <span
              title="Critical security alert cannot be dismissed"
              style={{
                padding: '4px',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Lock size={14} />
            </span>
          )}
        </div>

        {destination && (
          <ArrowRight
            size={14}
            color="var(--color-slate-400)"
            className="card-arrow-indicator"
            style={{ opacity: 0.7 }}
          />
        )}
      </div>

      <style>{`
        .looop-notification-card:hover {
          transform: translateY(-1px);
          border-color: #059669 !important;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08) !important;
        }
        .looop-notification-card:focus-visible {
          outline: 2px solid #059669;
          outline-offset: 2px;
        }
        .looop-notification-card:hover .card-arrow-indicator {
          color: #059669 !important;
          transform: translateX(2px);
          transition: all 150ms ease;
        }
        .notif-dismiss-btn:hover {
          color: #ef4444 !important;
          background-color: #fee2e2;
        }
      `}</style>
    </div>
  );
};

export default NotificationCard;
