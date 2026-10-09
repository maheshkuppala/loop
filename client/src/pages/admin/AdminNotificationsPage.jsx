import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  RefreshCw,
  UserCheck,
  Clock,
  Shield,
  FileText,
  Mail,
  User,
  Package,
  Layers,
  Sparkles,
  Search,
  X,
  Sliders,
  Check,
  Slash
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminPagination from '../../components/admin/AdminPagination';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export const AdminNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'preferences'
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    today: 0,
    recipients: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters & Pagination for Feed
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Preferences search & pagination
  const [prefPage, setPrefPage] = useState(1);
  const [prefTotalPages, setPrefTotalPages] = useState(1);
  const [prefSearch, setPrefSearch] = useState('');

  // Selected Notification Inspector Modal
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  // Send Notification Dialog State
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    recipientId: '',
    isBulk: false,
    title: '',
    message: '',
    type: 'SYSTEM_ANNOUNCEMENT',
    category: 'system',
    link: '/notifications'
  });
  const [sendConfirmationOpen, setSendConfirmationOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Status Action Confirmation Modal
  const [actionConfirm, setActionConfirm] = useState({
    isOpen: false,
    notifId: null,
    actionType: null, // 'MARK_READ' | 'MARK_UNREAD' | 'DISMISS'
    title: '',
    message: ''
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getNotifications({
        page,
        limit,
        search,
        status: statusFilter,
        type: typeFilter,
        dateRange: dateFilter
      });
      if (res && res.success) {
        setNotifications(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || 0);
        }
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications feed:', err);
      setError(err.response?.data?.message || 'Failed to fetch notifications list.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, typeFilter, dateFilter]);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getNotificationPreferences({
        page: prefPage,
        limit: 15,
        search: prefSearch
      });
      if (res && res.success) {
        setPreferences(res.data || []);
        if (res.pagination) {
          setPrefTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [prefPage, prefSearch]);

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchNotifications();
    } else {
      fetchPreferences();
    }
  }, [activeTab, fetchNotifications, fetchPreferences]);

  const handleInspectNotif = async (id) => {
    try {
      setInspectorLoading(true);
      const res = await adminService.getNotificationDetails(id);
      if (res && res.success) {
        setSelectedNotif(res.data);
      }
    } catch (err) {
      console.error('Failed to inspect notification:', err);
    } finally {
      setInspectorLoading(false);
    }
  };

  const handleOpenActionConfirm = (notif, actionType) => {
    const titles = {
      MARK_READ: 'Mark Notification as Read',
      MARK_UNREAD: 'Mark Notification as Unread',
      DISMISS: 'Dismiss Notification'
    };
    const messages = {
      MARK_READ: `Are you sure you want to mark notification #${notif.id} as READ?`,
      MARK_UNREAD: `Are you sure you want to mark notification #${notif.id} as UNREAD?`,
      DISMISS: `Are you sure you want to DISMISS notification #${notif.id}? It will be soft-deleted from the user's active inbox.`
    };
    setActionConfirm({
      isOpen: true,
      notifId: notif.id,
      actionType,
      title: titles[actionType] || 'Confirm Action',
      message: messages[actionType] || 'Proceed with this administrative status update?'
    });
  };

  const handleExecuteStatusUpdate = async () => {
    const { notifId, actionType } = actionConfirm;
    if (!notifId || !actionType) return;
    try {
      setLoading(true);
      const res = await adminService.updateNotificationStatus(notifId, actionType, 'Admin dashboard action');
      if (res && res.success) {
        setSuccessMessage(`Notification updated cleanly to ${actionType}.`);
        if (selectedNotif && selectedNotif.id === notifId) {
          setSelectedNotif(res.data);
        }
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to update notification status:', err);
      setError(err.response?.data?.message || 'Status update failed.');
    } finally {
      setActionConfirm({ isOpen: false, notifId: null, actionType: null, title: '', message: '' });
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!sendForm.title.trim() || !sendForm.message.trim()) {
      setError('Notification Title and Message are required.');
      return;
    }
    if (!sendForm.isBulk && !sendForm.recipientId.trim()) {
      setError('Target Recipient User ID is required when sending to a specific user.');
      return;
    }
    setSendConfirmationOpen(true);
  };

  const handleConfirmSend = async () => {
    try {
      setSending(true);
      setError(null);
      const payload = {
        recipientId: sendForm.isBulk ? 'ALL' : sendForm.recipientId.trim(),
        title: sendForm.title.trim(),
        message: sendForm.message.trim(),
        type: sendForm.type,
        category: sendForm.category,
        link: sendForm.link.trim() || '/notifications',
        isBulk: sendForm.isBulk
      };
      const res = await adminService.sendAdminNotification(payload);
      if (res && res.success) {
        setSuccessMessage(res.message || 'Notification delivered successfully!');
        setIsSendOpen(false);
        setSendConfirmationOpen(false);
        setSendForm({
          recipientId: '',
          isBulk: false,
          title: '',
          message: '',
          type: 'SYSTEM_ANNOUNCEMENT',
          category: 'system',
          link: '/notifications'
        });
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to send admin notification:', err);
      setError(err.response?.data?.message || 'Failed to deliver notification.');
    } finally {
      setSending(false);
      setSendConfirmationOpen(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Bell size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              Notifications Hub & Administrative Dispatch
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
              Real-time monitoring of system alerts, user notification feeds, preferences, and bulk administrative dispatches.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              if (activeTab === 'feed') fetchNotifications();
              else fetchPreferences();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsSendOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)'
            }}
          >
            <Send size={18} />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* PostgreSQL Real-Time Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <AdminStatCard title="Total Notifications" value={stats.total.toLocaleString()} icon={Bell} trend={{ isPositive: true }} color="#38bdf8" />
        <AdminStatCard title="Unread Inbox" value={stats.unread.toLocaleString()} icon={Clock} color="#fbbf24" />
        <AdminStatCard title="Read / Consumed" value={stats.read.toLocaleString()} icon={CheckCircle2} color="#34d399" />
        <AdminStatCard title="Delivered Today" value={stats.today.toLocaleString()} icon={Sparkles} color="#c084fc" />
        <AdminStatCard title="Active Recipients" value={stats.recipients.toLocaleString()} icon={UserCheck} color="#f472b6" />
      </div>

      {/* Main Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', gap: '1.5rem', marginBottom: '-0.5rem' }}>
        <button
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '12px 4px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'feed' ? '#38bdf8' : '#94a3b8',
            borderBottom: activeTab === 'feed' ? '2px solid #38bdf8' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Bell size={18} />
          <span>Notifications Feed ({totalCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          style={{
            padding: '12px 4px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'preferences' ? '#38bdf8' : '#94a3b8',
            borderBottom: activeTab === 'preferences' ? '2px solid #38bdf8' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sliders size={18} />
          <span>User Notification Preferences</span>
        </button>
      </div>

      {/* TAB 1: NOTIFICATIONS FEED */}
      {activeTab === 'feed' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '280px', maxWidth: '450px' }}>
              <AdminSearch
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                placeholder="Search recipient name, email, title, message..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '10px', border: '1px solid #334155' }}>
                {['ALL', 'UNREAD', 'READ', 'DISMISSED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setPage(1);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: statusFilter === st ? '#38bdf8' : 'transparent',
                      color: statusFilter === st ? '#0f172a' : '#94a3b8'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <option value="ALL">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Notifications Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Notification ID</th>
                  <th style={{ padding: '12px 16px' }}>Recipient User</th>
                  <th style={{ padding: '12px 16px' }}>Title & Content Preview</th>
                  <th style={{ padding: '12px 16px' }}>Type / Category</th>
                  <th style={{ padding: '12px 16px' }}>Read Status</th>
                  <th style={{ padding: '12px 16px' }}>Created Timestamp</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                      <span>Loading PostgreSQL notification feed...</span>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No notification records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  notifications.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid rgba(30, 41, 59, 0.6)',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        #{item.id}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#e2e8f0', fontSize: '0.8rem' }}>
                            {item.recipient?.avatar ? (
                              <img src={item.recipient.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            ) : (
                              (item.recipient?.name?.[0] || 'U').toUpperCase()
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>{item.recipient?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.recipient?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem', marginBottom: '2px' }}>{item.title}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.message}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                          {item.type}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={item.deletedAt ? 'DISMISSED' : item.isRead ? 'READ' : 'UNREAD'} />
                      </td>

                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleInspectNotif(item.id)}
                            title="Inspect Details"
                            style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', cursor: 'pointer' }}
                          >
                            <Eye size={16} />
                          </button>

                          {!item.isRead ? (
                            <button
                              onClick={() => handleOpenActionConfirm(item, 'MARK_READ')}
                              title="Mark as Read"
                              style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#34d399', cursor: 'pointer' }}
                            >
                              <Check size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenActionConfirm(item, 'MARK_UNREAD')}
                              title="Mark as Unread"
                              style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fbbf24', cursor: 'pointer' }}
                            >
                              <Clock size={16} />
                            </button>
                          )}

                          {!item.deletedAt && (
                            <button
                              onClick={() => handleOpenActionConfirm(item, 'DISMISS')}
                              title="Dismiss Notification"
                              style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f87171', cursor: 'pointer' }}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* TAB 2: USER NOTIFICATION PREFERENCES */}
      {activeTab === 'preferences' && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AdminSearch
                value={prefSearch}
                onChange={(val) => {
                  setPrefSearch(val);
                  setPrefPage(1);
                }}
                placeholder="Search user by name or email..."
              />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
              Read-only view of user notification settings & quiet hours preferences stored in PostgreSQL.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>User Profile</th>
                  <th style={{ padding: '12px 16px' }}>In-App Delivery</th>
                  <th style={{ padding: '12px 16px' }}>Browser Push</th>
                  <th style={{ padding: '12px 16px' }}>Quiet Hours Status</th>
                  <th style={{ padding: '12px 16px' }}>Enabled Categories</th>
                  <th style={{ padding: '12px 16px' }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                      <span>Loading user notification preferences...</span>
                    </td>
                  </tr>
                ) : preferences.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No user notification preferences registered yet.
                    </td>
                  </tr>
                ) : (
                  preferences.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.6)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{p.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.user?.email}</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: p.inApp ? '#34d399' : '#f87171', fontWeight: 700, fontSize: '0.8rem' }}>
                          {p.inApp ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: p.browser ? '#34d399' : '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                          {p.browser ? 'ENABLED' : 'OFF'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                        {p.quietHours?.enabled ? (
                          <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                            {p.quietHours.start || '22:00'} - {p.quietHours.end || '07:00'}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>Inactive</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {Object.entries(p.categories || {}).map(([catKey, isEnabled]) => (
                            <span
                              key={catKey}
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                backgroundColor: isEnabled ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: isEnabled ? '#34d399' : '#f87171',
                                border: `1px solid ${isEnabled ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                              }}
                            >
                              {catKey}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={prefPage}
            totalPages={prefTotalPages}
            onPageChange={(p) => setPrefPage(p)}
          />
        </div>
      )}

      {/* INSPECTOR MODAL */}
      {selectedNotif && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Notification Details Inspector
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>
                  {selectedNotif.title}
                </h2>
              </div>
              <button onClick={() => setSelectedNotif(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Notification Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Notification ID</span>
                <div style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>#{selectedNotif.id}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status</span>
                <div><StatusBadge status={selectedNotif.deletedAt ? 'DISMISSED' : selectedNotif.isRead ? 'READ' : 'UNREAD'} /></div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Notification Type</span>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>{selectedNotif.type}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category</span>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem', textTransform: 'capitalize' }}>{selectedNotif.category}</div>
              </div>
            </div>

            {/* Recipient Profile */}
            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Target Recipient
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#38bdf8' }}>
                  {selectedNotif.recipient?.name?.[0] || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{selectedNotif.recipient?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedNotif.recipient?.email} (ID: {selectedNotif.recipient?.id})</div>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Notification Body Message
              </span>
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {selectedNotif.message}
              </div>
            </div>

            {/* Related Context If Present */}
            {(selectedNotif.relatedItem || selectedNotif.relatedRequest || selectedNotif.relatedTransaction) && (
              <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Linked Relational Context
                </span>
                {selectedNotif.relatedItem && (
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <strong>Item:</strong> {selectedNotif.relatedItem.title} (#{selectedNotif.relatedItem.id})
                  </div>
                )}
                {selectedNotif.relatedRequest && (
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <strong>Request:</strong> #{selectedNotif.relatedRequest.id} (Status: {selectedNotif.relatedRequest.status})
                  </div>
                )}
                {selectedNotif.relatedTransaction && (
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <strong>Transaction:</strong> #{selectedNotif.relatedTransaction.id} (Status: {selectedNotif.relatedTransaction.status})
                  </div>
                )}
              </div>
            )}

            {/* Footer Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
              <button
                onClick={() => setSelectedNotif(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#334155', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND ADMINISTRATIVE NOTIFICATION DIALOG */}
      {isSendOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#38bdf8" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Dispatch Administrative Notification
                </h2>
              </div>
              <button onClick={() => setIsSendOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Delivery Scope Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Delivery Scope
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSendForm({ ...sendForm, isBulk: false })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      backgroundColor: !sendForm.isBulk ? '#38bdf8' : '#1e293b',
                      color: !sendForm.isBulk ? '#0f172a' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Single User
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendForm({ ...sendForm, isBulk: true, recipientId: 'ALL' })}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      backgroundColor: sendForm.isBulk ? '#38bdf8' : '#1e293b',
                      color: sendForm.isBulk ? '#0f172a' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Bulk Send (All Active Users)
                  </button>
                </div>
              </div>

              {!sendForm.isBulk && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Target Recipient User ID *
                  </label>
                  <input
                    type="text"
                    value={sendForm.recipientId}
                    onChange={(e) => setSendForm({ ...sendForm, recipientId: e.target.value })}
                    placeholder="e.g. usr-demo-cust-1"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.875rem' }}
                    required={!sendForm.isBulk}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Notification Type
                  </label>
                  <select
                    value={sendForm.type}
                    onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.85rem' }}
                  >
                    <option value="SYSTEM_ANNOUNCEMENT">SYSTEM_ANNOUNCEMENT</option>
                    <option value="ADMIN_ALERT">ADMIN_ALERT</option>
                    <option value="SECURITY_ALERT">SECURITY_ALERT</option>
                    <option value="IMPACT_MILESTONE">IMPACT_MILESTONE</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={sendForm.category}
                    onChange={(e) => setSendForm({ ...sendForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.85rem' }}
                  >
                    <option value="system">System</option>
                    <option value="account">Account</option>
                    <option value="requests">Requests</option>
                    <option value="transactions">Transactions</option>
                    <option value="impact">Impact</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={sendForm.title}
                  onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                  placeholder="e.g. Scheduled System Maintenance"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Notification Message *
                </label>
                <textarea
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                  rows={4}
                  placeholder="Write message body here..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsSendOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: '#334155', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  Preview & Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION BEFORE SENDING */}
      {sendConfirmationOpen && (
        <ConfirmDialog
          isOpen={sendConfirmationOpen}
          title={sendForm.isBulk ? 'Confirm Mass Bulk Notification Send' : 'Confirm Administrative Notification Delivery'}
          message={
            sendForm.isBulk
              ? `WARNING: You are about to dispatch a platform-wide notification "${sendForm.title}" to ALL active users. This action cannot be undone. Are you sure?`
              : `Are you sure you want to send notification "${sendForm.title}" to user ID ${sendForm.recipientId}?`
          }
          confirmLabel={sendForm.isBulk ? 'Dispatch to All Users' : 'Send Notification'}
          confirmVariant="primary"
          onConfirm={handleConfirmSend}
          onCancel={() => setSendConfirmationOpen(false)}
          loading={sending}
        />
      )}

      {/* STATUS UPDATE ACTION CONFIRM DIALOG */}
      {actionConfirm.isOpen && (
        <ConfirmDialog
          isOpen={actionConfirm.isOpen}
          title={actionConfirm.title}
          message={actionConfirm.message}
          confirmLabel="Execute Update"
          confirmVariant="primary"
          onConfirm={handleExecuteStatusUpdate}
          onCancel={() => setActionConfirm({ isOpen: false, notifId: null, actionType: null, title: '', message: '' })}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AdminNotificationsPage;
