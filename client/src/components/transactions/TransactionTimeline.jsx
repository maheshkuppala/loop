import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Package,
  Repeat,
  MapPin,
  PackageCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const TransactionTimeline = ({ transaction }) => {
  if (!transaction) return null;

  const isBorrow = transaction.type === 'BORROW';
  const status = transaction.status;

  // Build authentic timeline events strictly from real MongoDB timestamps & flags
  const events = [
    {
      id: 'created',
      title: 'Transaction Initiated',
      description: 'Accepted request created sharing transaction',
      timestamp: transaction.createdAt,
      icon: Package,
      state: 'completed',
      color: '#059669'
    }
  ];

  // 1. Handover Scheduled
  if (transaction.handoverDate || transaction.status === 'HANDOVER_SCHEDULED' || transaction.handoverConfirmedAt || transaction.status === 'ACTIVE' || transaction.status === 'COMPLETED') {
    events.push({
      id: 'scheduled',
      title: 'Handover Arranged',
      description: transaction.handoverDate
        ? `Meeting set for ${new Date(transaction.handoverDate).toLocaleDateString()}${transaction.handoverTime ? ` at ${transaction.handoverTime}` : ''}`
        : 'Meeting arrangements coordinated',
      timestamp: transaction.handoverDate || null,
      icon: Calendar,
      state: 'completed',
      color: '#059669'
    });
  } else if (transaction.status === 'PENDING_HANDOVER') {
    events.push({
      id: 'scheduling_pending',
      title: 'Coordinate Meeting',
      description: 'Participants arrange in-person handover location and time',
      timestamp: null,
      icon: Clock,
      state: 'active',
      color: '#d97706'
    });
  }

  // 2. Handover Confirmations
  if (transaction.handoverConfirmedAt || transaction.status === 'ACTIVE' || transaction.status === 'RETURN_PENDING' || transaction.status === 'COMPLETED') {
    events.push({
      id: 'handed_over',
      title: 'Handover Confirmed',
      description: 'Both participants confirmed safe item transfer',
      timestamp: transaction.handoverConfirmedAt || null,
      icon: CheckCircle2,
      state: 'completed',
      color: '#059669'
    });
  } else if (transaction.handoverConfirmedByOwner || transaction.handoverConfirmedByRecipient) {
    events.push({
      id: 'partial_handover',
      title: 'Handover Partially Confirmed',
      description: transaction.handoverConfirmedByOwner
        ? 'Owner confirmed item handover. Waiting for recipient receipt confirmation.'
        : 'Recipient confirmed receipt. Waiting for owner handover confirmation.',
      timestamp: null,
      icon: Clock,
      state: 'active',
      color: '#d97706'
    });
  }

  // 3. For Borrow: Active Usage, Return Process, and Returned
  if (isBorrow) {
    if (transaction.status === 'ACTIVE') {
      events.push({
        id: 'active_borrow',
        title: 'Active Borrowing Period',
        description: transaction.expectedReturnDate
          ? `Item in use. Expected return by ${new Date(transaction.expectedReturnDate).toLocaleDateString()}`
          : 'Item in active use by borrower',
        timestamp: null,
        icon: Clock,
        state: 'active',
        color: '#0284c7'
      });
    }

    if (transaction.status === 'RETURN_PENDING') {
      events.push({
        id: 'return_pending',
        title: 'Return In Progress',
        description: 'Borrower initiated return. Waiting for owner receipt confirmation.',
        timestamp: null,
        icon: Clock,
        state: 'active',
        color: '#d97706'
      });
    }

    if (transaction.returnedAt || (transaction.status === 'COMPLETED' && isBorrow)) {
      events.push({
        id: 'returned',
        title: 'Item Returned to Owner',
        description: 'Owner confirmed receiving the item back in good condition',
        timestamp: transaction.returnedAt || transaction.completedAt,
        icon: CheckCircle2,
        state: 'completed',
        color: '#059669'
      });
    }
  }

  // 4. Completed State
  if (transaction.status === 'COMPLETED') {
    events.push({
      id: 'completed',
      title: 'Transaction Completed',
      description: isBorrow ? 'Borrow cycle completed successfully' : 'Item successfully shared with neighbor',
      timestamp: transaction.completedAt,
      icon: PackageCheck,
      state: 'completed',
      color: '#059669'
    });
  }

  return (
    <div className="transaction-timeline" style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {events.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '17px',
                    top: '34px',
                    bottom: '-6px',
                    width: '2px',
                    backgroundColor: event.state === 'completed' ? '#a7f3d0' : '#e2e8f0',
                    zIndex: 1
                  }}
                />
              )}

              {/* Step Icon Badge */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor:
                    event.state === 'completed'
                      ? '#ecfdf5'
                      : event.state === 'active'
                      ? '#fffbeb'
                      : '#f8fafc',
                  border: `2px solid ${event.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: event.color,
                  zIndex: 2,
                  flexShrink: 0
                }}
              >
                <Icon size={16} />
              </div>

              {/* Step Content */}
              <div style={{ flex: 1, paddingBottom: isLast ? '0' : '1.75rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
                    {event.title}
                  </h4>
                  {event.timestamp && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {formatDate(event.timestamp)}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--color-slate-600)', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTimeline;
