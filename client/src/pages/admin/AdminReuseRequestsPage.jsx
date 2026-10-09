import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  CheckCircle,
  AlertCircle
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

export const AdminReuseRequestsPage = () => {
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
      console.error('Failed to load reuse requests:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve reuse requests from database.' });
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
          setNotification({ type: 'success', message: 'Request approved successfully! Item reserved.' });
          setConfirmDialogTarget(null);
          setIsDetailsOpen(false);
          fetchRequests();
        }
      } else {
        const res = await adminService.rejectRequest(reqId, reason);
        if (res?.success) {
          setNotification({ type: 'success', message: 'Request declined.' });
          setConfirmDialogTarget(null);
          setIsDetailsOpen(false);
          fetchRequests();
        }
      }
    } catch (err) {
      console.error('Request action error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to process request action.'
      });
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const columns = [
    {
      header: 'Reuse Item',
      accessor: 'item',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={r.item?.images?.[0]?.url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=100'}
            alt=""
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{r.item?.title || 'Reuse Item'}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.item?.category || 'General'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Requester',
      accessor: 'requester',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Avatar src={r.requester?.avatar} name={r.requester?.name || 'User'} size="xs" />
          <span style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>{r.requester?.name}</span>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'owner',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Avatar src={r.owner?.avatar} name={r.owner?.name || 'Owner'} size="xs" />
          <span style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>{r.owner?.name}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (r) => (
        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
          {r.type?.replace(/_/g, ' ')}
        </span>
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
          {new Date(r.createdAt).toLocaleDateString()}
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
              cursor: 'pointer'
            }}
          >
            <Eye size={12} />
            <span>Details</span>
          </button>

          {r.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => handleOpenConfirm(r, 'approve')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#34d399',
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
                <span>Decline</span>
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          <Gift size={26} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
            Reuse Requests
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Monitor and manage community requests to reuse items shared on the platform.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <AdminStatCard
          title="Total Reuse Requests"
          value={stats.totalRequests}
          subtitle="All platform requests"
          icon={FileText}
          color="#38bdf8"
          isLoading={isLoading}
        />
        <AdminStatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          subtitle="Awaiting owner / admin action"
          icon={Clock}
          color="#fbbf24"
          isLoading={isLoading}
        />
        <AdminStatCard
          title="Approved Requests"
          value={stats.approvedRequests}
          subtitle="Accepted & item reserved"
          icon={CheckCircle2}
          color="#34d399"
          isLoading={isLoading}
        />
        <AdminStatCard
          title="Completed Requests"
          value={stats.completedRequests}
          subtitle="Fulfilled or closed requests"
          icon={Gift}
          color="#818cf8"
          isLoading={isLoading}
        />
      </div>

      {notification && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${notification.type === 'error' ? 'var(--color-danger)' : '#10b981'}`,
            borderRadius: 'var(--radius-sm)',
            color: notification.type === 'error' ? '#f87171' : '#34d399',
            fontSize: '0.85rem'
          }}
        >
          {notification.message}
        </div>
      )}

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
          placeholder="Search by requester, owner, or item..."
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
          <option value="ACCEPTED">Accepted / Approved</option>
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
          <option value="REUSE">Reuse / Giveaway</option>
          <option value="BORROW">Borrow Item</option>
          <option value="EXCHANGE">Exchange Item</option>
        </select>
      </AdminFilterBar>

      {/* Requests Table */}
      <AdminTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        emptyMessage="No reuse requests found matching current criteria."
      />

      {/* Pagination */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={15}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Details Modal */}
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
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Request Details
              </h2>
              {selectedRequest && <StatusBadge status={selectedRequest.status} />}
            </div>

            {detailsLoading || !selectedRequest ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <Spinner size="md" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Target Item</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedRequest.item?.title}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                    Category: {selectedRequest.item?.category} • Sharing: {selectedRequest.item?.sharingType}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Requester</span>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{selectedRequest.requester?.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>{selectedRequest.requester?.email}</span>
                  </div>
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Product Owner</span>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{selectedRequest.owner?.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>{selectedRequest.owner?.email}</span>
                  </div>
                </div>

                {selectedRequest.message && (
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Requester Note</span>
                    <p style={{ color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>{selectedRequest.message}</p>
                  </div>
                )}

                {selectedRequest.expectedReturnDate && (
                  <div style={{ backgroundColor: '#0f172a', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Expected Return Date: </span>
                    <span style={{ color: '#38bdf8' }}>{new Date(selectedRequest.expectedReturnDate).toLocaleDateString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</span>
                  <span>ID: {selectedRequest.id || selectedRequest._id}</span>
                </div>

                {selectedRequest.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenConfirm(selectedRequest, 'approve')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#10b981',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: '#022c22',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Approve Request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenConfirm(selectedRequest, 'reject')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#f87171',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Decline Request
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmDialogTarget)}
        title={confirmDialogAction === 'approve' ? 'Approve Reuse Request?' : 'Decline Reuse Request?'}
        message={
          confirmDialogAction === 'approve'
            ? 'Approving this request will accept the item handover request and set item availability to Reserved.'
            : 'Declining will notify the requester and keep the item available for other community members.'
        }
        confirmLabel={confirmDialogAction === 'approve' ? 'Approve Request' : 'Decline Request'}
        confirmVariant={confirmDialogAction === 'approve' ? 'primary' : 'danger'}
        requireReason={confirmDialogAction !== 'approve'}
        reasonPlaceholder="Specify reason for declining request..."
        isLoading={isConfirmLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialogTarget(null)}
      />
    </div>
  );
};

export default AdminReuseRequestsPage;
