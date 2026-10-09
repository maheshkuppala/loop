import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRightLeft,
  Gift,
  Repeat
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

export const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState({ totalRequests: 0, pendingRequests: 0, approvedRequests: 0, completedRequests: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Request Details Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Confirm Action Dialog State
  const [confirmDialogTarget, setConfirmDialogTarget] = useState(null);
  const [confirmDialogAction, setConfirmDialogAction] = useState('approve'); // 'approve' | 'reject'
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getRequests({
        page,
        limit: 15,
        search,
        status: statusFilter,
        type: typeFilter
      });
      if (res?.success) {
        setRequests(res.data.requests || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve requests from database.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenDetails = async (reqItem) => {
    setIsDetailsOpen(true);
    try {
      setDetailsLoading(true);
      const res = await adminService.getRequestDetails(reqItem._id || reqItem.id);
      if (res?.success) {
        setSelectedRequest(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch request details:', err);
      setNotification({ type: 'error', message: 'Failed to fetch request details.' });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenConfirm = (reqItem, action) => {
    setConfirmDialogTarget(reqItem);
    setConfirmDialogAction(action);
  };

  const handleConfirmAction = async (reason) => {
    if (!confirmDialogTarget) return;
    const reqId = confirmDialogTarget._id || confirmDialogTarget.id;
    try {
      setIsConfirmLoading(true);
      if (confirmDialogAction === 'approve') {
        const res = await adminService.approveRequest(reqId);
        if (res?.success) {
          setNotification({ type: 'success', message: `Request #${reqId} accepted successfully.` });
          fetchRequests();
          if (selectedRequest && (selectedRequest._id === reqId || selectedRequest.id === reqId)) {
            const detailRes = await adminService.getRequestDetails(reqId);
            if (detailRes?.success) setSelectedRequest(detailRes.data);
          }
        }
      } else if (confirmDialogAction === 'reject') {
        const res = await adminService.rejectRequest(reqId, reason);
        if (res?.success) {
          setNotification({ type: 'success', message: `Request #${reqId} rejected.` });
          fetchRequests();
          if (selectedRequest && (selectedRequest._id === reqId || selectedRequest.id === reqId)) {
            const detailRes = await adminService.getRequestDetails(reqId);
            if (detailRes?.success) setSelectedRequest(detailRes.data);
          }
        }
      }
    } catch (err) {
      console.error('Action error:', err);
      setNotification({ type: 'error', message: err.response?.data?.message || err.message || 'Operation failed.' });
    } finally {
      setIsConfirmLoading(false);
      setConfirmDialogTarget(null);
    }
  };

  const renderTypeBadge = (type) => {
    const normType = (type || 'REUSE').toUpperCase();
    let bg = '#1e293b';
    let text = '#94a3b8';
    let icon = <Repeat size={12} />;

    switch (normType) {
      case 'BORROW':
        bg = 'rgba(56, 189, 248, 0.15)';
        text = '#38bdf8';
        icon = <ArrowRightLeft size={12} />;
        break;
      case 'REUSE':
        bg = 'rgba(168, 85, 247, 0.15)';
        text = '#c084fc';
        icon = <Repeat size={12} />;
        break;
      case 'EXCHANGE':
        bg = 'rgba(251, 146, 60, 0.15)';
        text = '#fb923c';
        icon = <ArrowRightLeft size={12} />;
        break;
      case 'GIVEAWAY':
        bg = 'rgba(34, 197, 94, 0.15)';
        text = '#4ade80';
        icon = <Gift size={12} />;
        break;
      default:
        break;
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          backgroundColor: bg,
          color: text,
          borderRadius: '9999px',
          fontSize: '0.725rem',
          fontWeight: 700,
          letterSpacing: '0.025em'
        }}
      >
        {icon}
        <span>{normType}</span>
      </span>
    );
  };

  const columns = [
    {
      header: 'Request ID',
      accessor: 'id',
      render: (r) => (
        <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
          #{r.id || r._id}
        </span>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (r) => renderTypeBadge(r.type)
    },
    {
      header: 'Requester',
      accessor: 'requester',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={r.requester?.avatar} name={r.requester?.name || 'User'} size="xs" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f8fafc', fontSize: '0.825rem', fontWeight: 600 }}>{r.requester?.name || 'Requester'}</span>
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{r.requester?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'owner',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={r.owner?.avatar} name={r.owner?.name || 'Owner'} size="xs" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f8fafc', fontSize: '0.825rem', fontWeight: 600 }}>{r.owner?.name || 'Owner'}</span>
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{r.owner?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Item',
      accessor: 'item',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {r.item?.images?.[0] ? (
            <img
              src={r.item.images[0].url || r.item.images[0]}
              alt=""
              style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-xs)', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <Layers size={16} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{r.item?.title || 'Shared Item'}</span>
            {r.item?.category && <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{r.item.category}</span>}
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Created',
      render: (r) => (
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleOpenDetails(r)}
            title="Inspect request details"
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
            <span>Inspect</span>
          </button>

          {r.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => handleOpenConfirm(r, 'approve')}
                title="Approve request"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#4ade80',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <CheckCircle size={12} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenConfirm(r, 'reject')}
                title="Reject request"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <XCircle size={12} />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
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
          All Requests
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Monitor and manage all community reuse, borrowing, exchange, and giveaway requests in real-time.
        </p>
      </div>

      {/* Summary Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <AdminStatCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={FileText}
          trend={{ value: 'All Types', isPositive: true }}
        />
        <AdminStatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
          trend={{ value: 'Awaiting Action', isPositive: false }}
        />
        <AdminStatCard
          title="Accepted Requests"
          value={stats.approvedRequests}
          icon={CheckCircle2}
          trend={{ value: 'Active/Approved', isPositive: true }}
        />
        <AdminStatCard
          title="Completed Requests"
          value={stats.completedRequests}
          icon={CheckCircle2}
          trend={{ value: 'Finalized/Resolved', isPositive: true }}
        />
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setTypeFilter('');
          setPage(1);
        }}
        hasActiveFilters={Boolean(search || statusFilter || typeFilter)}
      >
        <AdminSearch
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search requests, users, items..."
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
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DECLINED">Declined</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
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
          <option value="">All Request Types</option>
          <option value="REUSE">Reuse</option>
          <option value="BORROW">Borrow</option>
          <option value="EXCHANGE">Exchange</option>
          <option value="GIVEAWAY">Giveaway</option>
        </select>
      </AdminFilterBar>

      {/* Requests Table */}
      <AdminTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        emptyMessage="No requests match your current criteria."
      />

      {/* Pagination */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={15}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Detailed Request Inspector Modal */}
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
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Request Details
                </h2>
                {selectedRequest && renderTypeBadge(selectedRequest.type)}
              </div>
              {selectedRequest && <StatusBadge status={selectedRequest.status} />}
            </div>

            {detailsLoading || !selectedRequest ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <Spinner size="md" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
                {/* Item Info Card */}
                <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    Target Item Information
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedRequest.item?.images?.[0] && (
                      <img
                        src={selectedRequest.item.images[0].url || selectedRequest.item.images[0]}
                        alt=""
                        style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>{selectedRequest.item?.title || 'Shared Item'}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                        Category: {selectedRequest.item?.category || 'General'} | Availability: {selectedRequest.item?.availability || 'N/A'}
                      </span>
                      {selectedRequest.item?.location && (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Location: {selectedRequest.item.location}</span>
                      )}
                    </div>
                  </div>
                  {selectedRequest.item?.description && (
                    <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '8px', marginBottom: 0, fontStyle: 'italic' }}>
                      "{selectedRequest.item.description}"
                    </p>
                  )}
                </div>

                {/* Requester & Owner Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                      Requester
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar src={selectedRequest.requester?.avatar} name={selectedRequest.requester?.name} size="sm" />
                      <div>
                        <span style={{ color: '#f8fafc', fontWeight: 600, display: 'block' }}>{selectedRequest.requester?.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>{selectedRequest.requester?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                      Item Owner
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar src={selectedRequest.owner?.avatar} name={selectedRequest.owner?.name} size="sm" />
                      <div>
                        <span style={{ color: '#f8fafc', fontWeight: 600, display: 'block' }}>{selectedRequest.owner?.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>{selectedRequest.owner?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message / Description */}
                {selectedRequest.message && (
                  <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Requester Message / Note
                    </span>
                    <p style={{ color: '#f8fafc', margin: 0, fontSize: '0.85rem' }}>{selectedRequest.message}</p>
                  </div>
                )}

                {/* Return Date if Borrow */}
                {selectedRequest.expectedReturnDate && (
                  <div style={{ backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>Expected Return Date:</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>{new Date(selectedRequest.expectedReturnDate).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Related Transaction if Available */}
                {selectedRequest.transaction && (
                  <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #38bdf8' }}>
                    <span style={{ color: '#38bdf8', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Linked Transaction
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.8rem' }}>
                      <span>Transaction ID: #{selectedRequest.transaction.id || selectedRequest.transaction._id}</span>
                      <span>Status: {selectedRequest.transaction.status}</span>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div style={{ backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</span>
                  {selectedRequest.acceptedAt && <span>Accepted: {new Date(selectedRequest.acceptedAt).toLocaleString()}</span>}
                  {selectedRequest.declinedAt && <span>Declined: {new Date(selectedRequest.declinedAt).toLocaleString()}</span>}
                  <span>Request ID: #{selectedRequest.id || selectedRequest._id}</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {selectedRequest?.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenConfirm(selectedRequest, 'approve');
                      }}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#22c55e',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Approve Request
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenConfirm(selectedRequest, 'reject');
                      }}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#ef4444',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>

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

      {/* Confirmation Modal */}
      {confirmDialogTarget && (
        <ConfirmDialog
          isOpen={Boolean(confirmDialogTarget)}
          title={confirmDialogAction === 'approve' ? 'Approve Community Request' : 'Reject Community Request'}
          message={
            confirmDialogAction === 'approve'
              ? `Are you sure you want to approve request #${confirmDialogTarget.id || confirmDialogTarget._id}? This will accept the request and update related item status.`
              : `Are you sure you want to reject request #${confirmDialogTarget.id || confirmDialogTarget._id}?`
          }
          confirmLabel={confirmDialogAction === 'approve' ? 'Approve' : 'Reject'}
          confirmVariant={confirmDialogAction === 'approve' ? 'success' : 'danger'}
          requireReason={confirmDialogAction === 'reject'}
          reasonPlaceholder="Enter rejection reason for audit log..."
          isLoading={isConfirmLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmDialogTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminRequestsPage;
