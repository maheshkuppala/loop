import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Users,
  Layers,
  FileText,
  EyeOff,
  Trash2,
  RotateCcw,
  Send
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import AdminStatCard from '../../components/admin/AdminStatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';

export const AdminMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    activeConversations: 0,
    messagesToday: 0,
    flaggedMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Conversation Details & Message History Modal State
  const [selectedConv, setSelectedConv] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Confirm Moderation Dialog State
  const [confirmDialogTargetMsg, setConfirmDialogTargetMsg] = useState(null);
  const [confirmDialogAction, setConfirmDialogAction] = useState('HIDE'); // 'HIDE' | 'DELETE' | 'RESTORE'
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getConversations({
        page,
        limit: 15,
        search,
        status: statusFilter
      });
      if (res?.success) {
        const convData = res.data.conversations || [];
        setConversations(convData);
        setTotal(res.data.total || convData.length || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve conversations from database.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessagesForConversation = async (convId) => {
    try {
      setMessagesLoading(true);
      const res = await adminService.getMessages(convId, { limit: 100 });
      if (res?.success) {
        setConvMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages history:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleOpenDetails = async (convItem) => {
    setIsDetailsOpen(true);
    const convId = convItem._id || convItem.id;
    try {
      setDetailsLoading(true);
      const res = await adminService.getConversationDetails(convId);
      if (res?.success) {
        setSelectedConv(res.data);
      } else {
        setSelectedConv(convItem);
      }
      await fetchMessagesForConversation(convId);
    } catch (err) {
      console.error('Failed to fetch conversation details:', err);
      setSelectedConv(convItem);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenConfirmModeration = (msgItem, action) => {
    setConfirmDialogTargetMsg(msgItem);
    setConfirmDialogAction(action);
  };

  const handleConfirmModeration = async (reason) => {
    if (!confirmDialogTargetMsg) return;
    const msgId = confirmDialogTargetMsg._id || confirmDialogTargetMsg.id;
    try {
      setIsConfirmLoading(true);
      const res = await adminService.moderateMessage(msgId, confirmDialogAction, reason);
      if (res?.success) {
        setNotification({
          type: 'success',
          message: `Message #${msgId} has been updated to ${res.messageData?.status || confirmDialogAction}.`
        });
        if (selectedConv) {
          await fetchMessagesForConversation(selectedConv._id || selectedConv.id);
        }
        fetchConversations();
      }
    } catch (err) {
      console.error('Message moderation error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to moderate message.'
      });
    } finally {
      setIsConfirmLoading(false);
      setConfirmDialogTargetMsg(null);
    }
  };

  const columns = [
    {
      header: 'Conversation ID',
      accessor: 'id',
      render: (c) => (
        <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
          #{c.id || c._id}
        </span>
      )
    },
    {
      header: 'Participants',
      accessor: 'participants',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', marginLeft: '4px' }}>
            {(c.participants || []).slice(0, 3).map((p, idx) => (
              <div key={p.id || idx} style={{ marginLeft: idx > 0 ? '-8px' : '0', border: '2px solid #0f172a', borderRadius: '50%' }}>
                <Avatar src={p.avatar} name={p.name} size="xs" />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f8fafc', fontSize: '0.825rem', fontWeight: 600 }}>
              {(c.participants || []).map(p => p.name).join(', ') || 'Members'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>
              {(c.participants || []).length} participants
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Last Message Preview',
      accessor: 'lastMessageText',
      render: (c) => (
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '240px' }}>
          <span style={{ color: '#cbd5e1', fontSize: '0.825rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.lastMessageText || 'No message recorded'}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.725rem' }}>
            {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : 'N/A'}
          </span>
        </div>
      )
    },
    {
      header: 'Related Context',
      accessor: 'item',
      render: (c) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {c.item ? (
            <span style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.825rem' }}>{c.item.title}</span>
          ) : c.request ? (
            <span style={{ fontWeight: 600, color: '#c084fc', fontSize: '0.825rem' }}>Request #{c.request.id}</span>
          ) : (
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>General Inquiry</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (c) => <StatusBadge status={c.status || 'ACTIVE'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <button
          type="button"
          onClick={() => handleOpenDetails(c)}
          title="Inspect conversation history"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            backgroundColor: '#334155',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            color: '#f8fafc',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Eye size={12} />
          <span>Inspect Chat</span>
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner Notifications */}
      {notification && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            border: `1px solid ${notification.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
            color: notification.type === 'error' ? '#f87171' : '#4ade80',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
          Messages Oversight
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Monitor community chat threads, review member conversation context, and safely moderate reported or policy-violating messages.
        </p>
      </div>

      {/* Summary Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <AdminStatCard
          title="Total Conversations"
          value={stats.totalConversations}
          icon={MessageSquare}
          trend={{ value: 'All Threads', isPositive: true }}
        />
        <AdminStatCard
          title="Total Messages"
          value={stats.totalMessages}
          icon={Send}
          trend={{ value: 'Chat Volume', isPositive: true }}
        />
        <AdminStatCard
          title="Active Conversations"
          value={stats.activeConversations}
          icon={CheckCircle2}
          trend={{ value: 'Active Threads', isPositive: true }}
        />
        <AdminStatCard
          title="Messages Today"
          value={stats.messagesToday}
          icon={Clock}
          trend={{ value: 'Last 24 Hours', isPositive: true }}
        />
        <AdminStatCard
          title="Flagged / Moderated"
          value={stats.flaggedMessages}
          icon={ShieldAlert}
          trend={{ value: 'Hidden/Flagged', isPositive: false }}
        />
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setPage(1);
        }}
        hasActiveFilters={Boolean(search || statusFilter)}
      >
        <AdminSearch
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search conversation ID, participant, item..."
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-sm)',
            color: '#f8fafc',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
          <option value="FLAGGED">Flagged</option>
        </select>
      </AdminFilterBar>

      {/* Conversations Table */}
      <AdminTable
        columns={columns}
        data={conversations}
        isLoading={isLoading}
        emptyMessage="No conversations match the selected criteria."
      />

      {/* Pagination */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={15}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Conversation Inspector & Message History Modal */}
      {isDetailsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Conversation Inspector
                </h2>
                {selectedConv && <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>#{selectedConv.id}</span>}
              </div>
              {selectedConv && <StatusBadge status={selectedConv.status || 'ACTIVE'} />}
            </div>

            {detailsLoading || !selectedConv ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Spinner size="md" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                {/* Context Card (Item / Request) */}
                {selectedConv.item && (
                  <div style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedConv.item.images?.[0] && (
                      <img
                        src={selectedConv.item.images[0].url || selectedConv.item.images[0]}
                        alt=""
                        style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <span style={{ color: '#38bdf8', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Transacted Item Context</span>
                      <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{selectedConv.item.title}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Category: {selectedConv.item.category || 'General'} | Status: {selectedConv.item.availability || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {/* Participants Grid */}
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                    Conversation Participants ({(selectedConv.participants || []).length})
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {(selectedConv.participants || []).map(p => (
                      <div key={p.id} style={{ backgroundColor: '#0f172a', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={p.avatar} name={p.name} size="sm" />
                        <div>
                          <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{p.name}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.725rem', display: 'block' }}>{p.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message History Stream */}
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                    Chronological Message History ({convMessages.length})
                  </span>

                  {messagesLoading ? (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <Spinner size="sm" />
                    </div>
                  ) : convMessages.length === 0 ? (
                    <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      No messages recorded in this conversation.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', maxHeight: '320px', overflowY: 'auto' }}>
                      {convMessages.map(msg => {
                        const isHidden = (msg.status || '').toUpperCase() === 'HIDDEN' || (msg.status || '').toUpperCase() === 'DELETED';
                        return (
                          <div
                            key={msg.id || msg._id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isHidden ? 'rgba(239, 68, 68, 0.1)' : '#1e293b',
                              border: `1px solid ${isHidden ? 'rgba(239, 68, 68, 0.3)' : '#334155'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Avatar src={msg.sender?.avatar} name={msg.sender?.name || 'User'} size="xs" />
                                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.8rem' }}>{msg.sender?.name || 'Sender'}</span>
                                <span style={{ color: '#64748b', fontSize: '0.725rem' }}>({msg.sender?.email})</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {msg.status && msg.status !== 'ACTIVE' && <StatusBadge status={msg.status} />}
                                <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            <p style={{ color: isHidden ? '#f87171' : '#cbd5e1', fontSize: '0.85rem', margin: '4px 0 6px 0', fontStyle: isHidden ? 'italic' : 'normal' }}>
                              {msg.text}
                            </p>

                            {/* Message Moderation Toolbar */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              {isHidden ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenConfirmModeration(msg, 'RESTORE')}
                                  title="Restore message"
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', backgroundColor: 'rgba(34, 197, 94, 0.15)', border: 'none', borderRadius: 'var(--radius-xs)', color: '#4ade80', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  <RotateCcw size={10} />
                                  <span>Restore</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenConfirmModeration(msg, 'HIDE')}
                                    title="Hide message from members"
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', backgroundColor: 'rgba(234, 179, 8, 0.15)', border: 'none', borderRadius: 'var(--radius-xs)', color: '#facc15', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                                  >
                                    <EyeOff size={10} />
                                    <span>Hide</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenConfirmModeration(msg, 'DELETE')}
                                    title="Delete message"
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 'var(--radius-xs)', color: '#f87171', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                                  >
                                    <Trash2 size={10} />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Moderation Confirmation Dialog */}
      {confirmDialogTargetMsg && (
        <ConfirmDialog
          isOpen={Boolean(confirmDialogTargetMsg)}
          title={`${confirmDialogAction === 'RESTORE' ? 'Restore' : confirmDialogAction === 'DELETE' ? 'Delete' : 'Hide'} Message`}
          message={`Are you sure you want to ${confirmDialogAction.toLowerCase()} message #${confirmDialogTargetMsg.id || confirmDialogTargetMsg._id}? "${confirmDialogTargetMsg.text}"`}
          confirmLabel={`${confirmDialogAction === 'RESTORE' ? 'Restore' : confirmDialogAction === 'DELETE' ? 'Delete' : 'Hide'} Message`}
          confirmVariant={confirmDialogAction === 'RESTORE' ? 'success' : 'danger'}
          requireReason={true}
          reasonPlaceholder="Enter administrative moderation reason for audit log..."
          isLoading={isConfirmLoading}
          onConfirm={handleConfirmModeration}
          onCancel={() => setConfirmDialogTargetMsg(null)}
        />
      )}
    </div>
  );
};

export default AdminMessagesPage;
