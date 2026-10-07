import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  Inbox,
  Repeat,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Package,
  ShieldAlert,
  Leaf
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import NotificationCard from '../../components/notifications/NotificationCard';
import NotificationPreferencesModal from '../../components/notifications/NotificationPreferencesModal';
import Button from '../../components/common/Button';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'requests', label: 'Requests', category: 'REQUESTS' },
  { id: 'transactions', label: 'Transactions', category: 'TRANSACTIONS' },
  { id: 'messages', label: 'Messages', category: 'MESSAGES' },
  { id: 'matching', label: 'Matching', category: 'MATCHING' },
  { id: 'items', label: 'Items', category: 'ITEMS' },
  { id: 'safety', label: 'Safety', category: 'SAFETY' },
  { id: 'account', label: 'Account', category: 'ACCOUNT' },
  { id: 'impact', label: 'Impact', category: 'IMPACT' }
];

export const Notifications = () => {
  const {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Trigger backend-filtered query whenever filter or page changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 20
    };

    if (activeFilter === 'unread') {
      params.read = 'false';
    } else if (activeFilter !== 'all') {
      const tabConfig = FILTER_TABS.find((t) => t.id === activeFilter);
      if (tabConfig && tabConfig.category) {
        params.category = tabConfig.category;
      }
    }

    fetchNotifications(params);
  }, [activeFilter, currentPage, fetchNotifications]);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const handleMarkAllReadClick = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* 1. Header Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                color: 'var(--color-slate-900)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount} new
              </span>
            )}
          </div>
          <p
            style={{
              color: 'var(--color-slate-500)',
              fontSize: '0.925rem',
              marginTop: '4px',
              marginBottom: 0
            }}
          >
            Authoritative, real-time activity and alerts for your LOOOP community interactions.
          </p>
        </div>

        {/* Action Controls: Preferences & Mark All as Read */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreferencesOpen(true)}
            iconLeft={SlidersHorizontal}
            style={{
              borderColor: 'var(--color-slate-200)',
              color: 'var(--color-slate-700)',
              fontWeight: 600
            }}
          >
            Preferences
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllReadClick}
            disabled={unreadCount === 0 || isMarkingAll || loading}
            iconLeft={CheckCheck}
            style={{
              borderColor: 'var(--color-slate-200)',
              color: unreadCount > 0 ? '#059669' : 'var(--color-slate-400)',
              fontWeight: 600
            }}
          >
            {isMarkingAll ? 'Updating...' : 'Mark all as read'}
          </Button>
        </div>
      </div>

      {/* 2. Filter Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '1.5rem',
          scrollbarWidth: 'none'
        }}
        className="notifications-filter-bar"
        role="tablist"
        aria-label="Notification categories"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleFilterChange(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#059669' : '#f1f5f9',
                color: isActive ? '#ffffff' : 'var(--color-slate-600)',
                whiteSpace: 'nowrap',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{tab.label}</span>
              {tab.id === 'unread' && unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: isActive ? '#047857' : '#059669',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    padding: '0 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{error}</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => fetchNotifications()}
            iconLeft={RefreshCw}
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4. Notification List Content */}
      {loading ? (
        // Loading Skeleton
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-slate-100)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-slate-100)',
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: '14px',
                    width: '35%',
                    backgroundColor: 'var(--color-slate-100)',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                />
                <div
                  style={{
                    height: '12px',
                    width: '75%',
                    backgroundColor: 'var(--color-slate-100)',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        // Real Empty State
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-slate-200)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <Bell size={26} />
          </div>

          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--color-slate-800)',
              marginBottom: '6px'
            }}
          >
            {activeFilter === 'unread' ? 'You’re all caught up.' : 'No notifications found'}
          </h3>

          <p
            style={{
              color: 'var(--color-slate-500)',
              fontSize: '0.9rem',
              maxWidth: '380px',
              margin: '0 auto 1.25rem auto',
              lineHeight: 1.5
            }}
          >
            {activeFilter === 'unread'
              ? 'You have reviewed all your activity alerts. New events will appear here as they occur.'
              : `There are currently no notifications in the ${activeFilter === 'all' ? 'platform' : activeFilter} stream.`}
          </p>

          {activeFilter !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('all')}
            >
              View all notifications
            </Button>
          )}
        </div>
      ) : (
        // Notifications Feed
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((notif) => (
            <NotificationCard
              key={notif._id || notif.id}
              notification={notif}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}

      {/* 5. Pagination Controls */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-slate-200)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '0.825rem', color: 'var(--color-slate-500)' }}>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total notifications)
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeft={ChevronLeft}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconRight={ChevronRight}
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 6. Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
