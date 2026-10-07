import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  PackageCheck,
  Send,
  Calendar
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const RequestTimeline = ({ request }) => {
  if (!request) return null;

  const status = (request.status || 'PENDING').toUpperCase();

  // Build real timeline items based on authentic MongoDB timestamps
  const events = [
    {
      id: 'created',
      title: 'Request Submitted',
      description: request.type === 'OFFER' ? 'Offer submitted to wanted request' : 'Request sent to item owner',
      timestamp: request.createdAt,
      icon: Send,
      state: 'completed',
      color: '#059669'
    }
  ];

  if (status === 'PENDING') {
    events.push({
      id: 'pending',
      title: 'Awaiting Owner Review',
      description: 'Waiting for the item owner to accept or decline',
      timestamp: null,
      icon: Clock,
      state: 'active',
      color: '#d97706'
    });
  } else if (status === 'ACCEPTED') {
    events.push({
      id: 'accepted',
      title: 'Request Accepted',
      description: 'Item owner accepted this request',
      timestamp: request.acceptedAt || request.updatedAt,
      icon: CheckCircle2,
      state: 'completed',
      color: '#059669'
    });
  } else if (status === 'DECLINED') {
    events.push({
      id: 'declined',
      title: 'Request Declined',
      description: 'The item owner respectfully declined the request',
      timestamp: request.declinedAt || request.updatedAt,
      icon: XCircle,
      state: 'closed',
      color: '#dc2626'
    });
  } else if (status === 'CANCELLED') {
    events.push({
      id: 'cancelled',
      title: 'Request Cancelled',
      description: 'The requester cancelled the pending request',
      timestamp: request.cancelledAt || request.updatedAt,
      icon: Ban,
      state: 'closed',
      color: '#64748b'
    });
  } else if (status === 'COMPLETED') {
    if (request.acceptedAt) {
      events.push({
        id: 'accepted',
        title: 'Request Accepted',
        description: 'Item owner accepted this request',
        timestamp: request.acceptedAt,
        icon: CheckCircle2,
        state: 'completed',
        color: '#059669'
      });
    }
    events.push({
      id: 'completed',
      title: 'Handover Completed',
      description: 'Sharing transaction concluded successfully',
      timestamp: request.completedAt || request.updatedAt,
      icon: PackageCheck,
      state: 'completed',
      color: '#0284c7'
    });
  }

  return (
    <div className="request-timeline" style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {events.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
              {/* Vertical connector line */}
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

              {/* Node Icon */}
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
                      : event.state === 'closed'
                      ? '#fef2f2'
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

              {/* Event Content */}
              <div style={{ flex: 1, paddingBottom: isLast ? '0' : '1.75rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <h4
                    style={{
                      fontSize: '0.925rem',
                      fontWeight: 800,
                      color: 'var(--color-slate-900)',
                      margin: 0
                    }}
                  >
                    {event.title}
                  </h4>
                  {event.timestamp && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-slate-500)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Clock size={12} />
                      {formatDate(event.timestamp)}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '0.825rem',
                    color: 'var(--color-slate-600)',
                    margin: '3px 0 0 0',
                    lineHeight: 1.45
                  }}
                >
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

export default RequestTimeline;
