import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, MessageSquare, Bell, ArrowRight, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export const ActivityAndMessages = ({ requests: rawRequests, conversations: rawConversations, notifications: rawNotifications }) => {
  const requests = Array.isArray(rawRequests)
    ? rawRequests
    : Array.isArray(rawRequests?.requests)
    ? rawRequests.requests
    : [];

  const conversations = Array.isArray(rawConversations)
    ? rawConversations
    : Array.isArray(rawConversations?.conversations)
    ? rawConversations.conversations
    : [];

  const notifications = Array.isArray(rawNotifications)
    ? rawNotifications
    : Array.isArray(rawNotifications?.notifications)
    ? rawNotifications.notifications
    : [];

  const [activeTab, setActiveTab] = useState('requests');

  // Format request status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'ACCEPTED':
        return <Badge variant="success">Accepted</Badge>;
      case 'COMPLETED':
        return <Badge variant="neutral">Completed</Badge>;
      case 'DECLINED':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-slate-200)',
        padding: '1.75rem',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
      }}
      className="activity-messages-container"
    >
      {/* Header & Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'requests' ? '#ecfdf5' : 'transparent',
              color: activeTab === 'requests' ? '#047857' : 'var(--color-slate-500)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Inbox size={16} />
            <span>Recent Requests</span>
            {requests?.length > 0 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: activeTab === 'requests' ? '#059669' : 'var(--color-slate-200)',
                  color: activeTab === 'requests' ? '#ffffff' : 'var(--color-slate-600)'
                }}
              >
                {requests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'messages' ? '#ecfdf5' : 'transparent',
              color: activeTab === 'messages' ? '#047857' : 'var(--color-slate-500)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <MessageSquare size={16} />
            <span>Recent Messages</span>
            {conversations?.some((c) => c.unreadCount > 0) && (
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444'
                }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'notifications' ? '#ecfdf5' : 'transparent',
              color: activeTab === 'notifications' ? '#047857' : 'var(--color-slate-500)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Bell size={16} />
            <span>Notifications</span>
          </button>
        </div>

        {/* View All Link depending on active tab */}
        <Link
          to={
            activeTab === 'requests'
              ? '/requests'
              : activeTab === 'messages'
              ? '/messages'
              : '/notifications'
          }
          style={{
            fontSize: '0.825rem',
            color: 'var(--color-primary-700)',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
          className="tab-view-all-link"
        >
          <span>View All {activeTab}</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 1. Requests Tab Content */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {requests?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-slate-400)', fontSize: '0.875rem' }}>
              No recent requests yet. Items requested or borrowed will appear here.
            </div>
          ) : (
            requests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-slate-200)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <Avatar
                    src={req.requester?.avatar || req.owner?.avatar}
                    name={req.requester?.name || req.owner?.name || 'Sharer'}
                    size="sm"
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                        {req.requester?.name || req.owner?.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                        {req.sharingType === 'borrow' ? 'requested to borrow' : req.sharingType === 'exchange' ? 'proposed exchange for' : 'requested'}
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-800)' }}>
                        "{req.itemTitle}"
                      </strong>
                    </div>
                    {req.message && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '480px' }}>
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {renderStatusBadge(req.status)}
                  <Link to="/customer/requests" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                      Manage
                    </span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Messages Tab Content */}
      {activeTab === 'messages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {conversations?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-slate-400)', fontSize: '0.875rem' }}>
              No messages yet. Direct messages with community members will appear here.
            </div>
          ) : (
            conversations.slice(0, 3).map((conv) => (
              <Link
                key={conv.id || conv._id}
                to={`/messages/${conv.id || conv._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: conv.unreadCount > 0 ? '#f0fdf4' : '#f8fafc',
                    border: '1px solid',
                    borderColor: conv.unreadCount > 0 ? '#bbf7d0' : 'var(--color-slate-200)',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="message-preview-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <Avatar
                      src={conv.participant?.avatar}
                      name={conv.participant?.name}
                      size="sm"
                      online={conv.participant?.online}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                          {conv.participant?.name}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              backgroundColor: '#059669',
                              color: '#ffffff',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)'
                            }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: conv.unreadCount > 0 ? 'var(--color-slate-800)' : 'var(--color-slate-500)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.725rem', color: 'var(--color-slate-400)', whiteSpace: 'nowrap', paddingLeft: '8px' }}>
                    {conv.lastMessageTime}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* 3. Notifications Tab Content */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications && notifications.length > 0 ? (
            notifications.slice(0, 4).map((notif) => {
              const notifId = notif._id || notif.id;
              const isUnread = notif.isRead === false || notif.unread === true;
              return (
                <Link
                  key={notifId}
                  to="/notifications"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isUnread ? '#f0fdf4' : '#f8fafc',
                      border: '1px solid',
                      borderColor: isUnread ? '#bbf7d0' : 'var(--color-slate-200)',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="message-preview-row"
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isUnread ? '#d1fae5' : 'var(--color-slate-200)',
                        color: isUnread ? '#059669' : 'var(--color-slate-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Bell size={15} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-900)' }}>
                          {notif.title}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', whiteSpace: 'nowrap' }}>
                          {notif.time || (notif.createdAt ? new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '')}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notif.message}
                      </p>
                    </div>
                    {isUnread && (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          flexShrink: 0,
                          alignSelf: 'center'
                        }}
                      />
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--color-slate-500)',
                fontSize: '0.875rem'
              }}
            >
              No recent notifications. You're all caught up!
            </div>
          )}
        </div>
      )}

      <style>{`
        .tab-view-all-link:hover {
          text-decoration: underline;
        }
        .message-preview-row:hover {
          border-color: var(--color-primary-400) !important;
          background-color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default ActivityAndMessages;
