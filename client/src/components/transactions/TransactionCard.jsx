import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  Clock,
  ArrowRight,
  User,
  Repeat,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/formatters';

export const TransactionCard = ({ transaction, currentUserId }) => {
  if (!transaction) return null;

  const txId = transaction.id || transaction._id;
  const item = transaction.item;
  const offeredItem = transaction.offeredItem;
  const isBorrow = transaction.type === 'BORROW';
  const isExchange = transaction.type === 'EXCHANGE';

  const isOwner =
    transaction.owner &&
    (transaction.owner._id === currentUserId ||
      transaction.owner.id === currentUserId);
  const otherParticipant = isOwner ? transaction.recipient : transaction.owner;
  const roleLabel = isOwner ? 'Recipient' : 'Owner';

  const itemTitle = item?.title || 'Shared Item';
  const primaryImage =
    Array.isArray(item?.images) && item.images.length > 0
      ? typeof item.images[0] === 'string'
        ? item.images[0]
        : item.images[0]?.url
      : null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'ACTIVE':
        return <Badge variant="primary">Active</Badge>;
      case 'HANDOVER_SCHEDULED':
        return <Badge variant="info">Handover Scheduled</Badge>;
      case 'RETURN_PENDING':
        return <Badge variant="warning">Return In Progress</Badge>;
      case 'PENDING_HANDOVER':
        return <Badge variant="warning">Pending Handover</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status?.replace('_', ' ')}</Badge>;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'FREE':
        return 'Free Share';
      case 'GIVEAWAY':
        return 'Give Away';
      case 'BORROW':
        return 'Borrow';
      case 'EXCHANGE':
        return 'Exchange';
      default:
        return type;
    }
  };

  // Overdue check for active borrow
  const isOverdue =
    isBorrow &&
    transaction.expectedReturnDate &&
    (transaction.status === 'ACTIVE' || transaction.status === 'RETURN_PENDING') &&
    new Date(transaction.expectedReturnDate) < new Date();

  return (
    <Card
      style={{
        padding: '1.5rem',
        border: '1px solid var(--color-slate-200)',
        borderRadius: 'var(--radius-lg)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
      }}
      className="transaction-card hover:shadow-md"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--color-slate-100)',
          paddingBottom: '1rem',
          marginBottom: '1rem'
        }}
      >
        {/* Left: Item Image & Information */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={itemTitle}
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-200)',
                flexShrink: 0
              }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Package size={28} />
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--color-primary-700)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {getTypeLabel(transaction.type)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-300)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                Started {formatDate(transaction.createdAt)}
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--color-slate-900)',
                margin: '0 0 4px 0',
                lineHeight: 1.3
              }}
            >
              {itemTitle}
            </h3>

            {/* Other participant */}
            {otherParticipant && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
                <span>{roleLabel}:</span>
                <strong style={{ color: 'var(--color-slate-800)' }}>{otherParticipant.name}</strong>
                {otherParticipant.trustScore && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                    ({otherParticipant.trustScore}% Trust)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status Badge & Overdue Alert */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div>{getStatusBadge(transaction.status)}</div>
          {isOverdue && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AlertCircle size={13} />
              <span>Return overdue</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle: Exchange Details or Borrow Return Date if applicable */}
      {(isBorrow || isExchange || transaction.handoverDate || transaction.handoverLocation?.city) && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--color-slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            fontSize: '0.85rem'
          }}
        >
          {/* Borrow Expected Return Date */}
          {isBorrow && transaction.expectedReturnDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOverdue ? '#dc2626' : 'var(--color-slate-700)' }}>
              <Calendar size={14} color={isOverdue ? '#dc2626' : 'var(--color-primary-700)'} />
              <span>
                Expected return: <strong>{new Date(transaction.expectedReturnDate).toLocaleDateString()}</strong>
              </span>
            </div>
          )}

          {/* Exchange Item Info */}
          {isExchange && offeredItem && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46' }}>
              <Repeat size={14} />
              <span>Exchanging with: <strong>{offeredItem.title}</strong></span>
            </div>
          )}

          {/* Handover Location / Meeting Point */}
          {(transaction.handoverLocation?.locality || transaction.handoverLocation?.city) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-slate-600)' }}>
              <MapPin size={13} color="var(--color-primary-600)" />
              <span>
                {transaction.handoverLocation.locality ? `${transaction.handoverLocation.locality}, ` : ''}
                {transaction.handoverLocation.city}
              </span>
            </div>
          )}

          {/* Handover Scheduled Time */}
          {transaction.handoverDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-slate-600)' }}>
              <Clock size={13} color="var(--color-primary-600)" />
              <span>
                Meeting: {new Date(transaction.handoverDate).toLocaleDateString()}
                {transaction.handoverTime ? ` at ${transaction.handoverTime}` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', fontFamily: 'monospace' }}>
          TX-{txId.slice(-6).toUpperCase()}
        </div>

        <Link to={`/transactions/${txId}`} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" iconRight={ArrowRight}>
            View Transaction
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default TransactionCard;
