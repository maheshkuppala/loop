import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRightLeft,
  Gift,
  Repeat,
  Calendar,
  User,
  FileText
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

export const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    activeTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    cancelledTransactions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Transaction Details Modal State
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Confirm Action Dialog State
  const [confirmDialogTarget, setConfirmDialogTarget] = useState(null);
  const [confirmDialogAction, setConfirmDialogAction] = useState('COMPLETED'); // 'COMPLETED' | 'CANCELLED'
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getTransactions({
        page,
        limit: 15,
        search,
        status: statusFilter,
        type: typeFilter
      });
      if (res?.success) {
        const txData = res.data.transactions || (Array.isArray(res.data) ? res.data : []);
        setTransactions(txData);
        setTotal(res.data.total || txData.length || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve transactions from database.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleOpenDetails = async (txItem) => {
    setIsDetailsOpen(true);
    const txId = txItem._id || txItem.id;
    try {
      setDetailsLoading(true);
      const res = await adminService.getTransactionDetails(txId);
      if (res?.success) {
        setSelectedTx(res.data.transaction || res.data);
      } else {
        setSelectedTx(txItem);
      }
    } catch (err) {
      console.error('Failed to fetch transaction details:', err);
      setSelectedTx(txItem);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenConfirm = (txItem, actionStatus) => {
    setConfirmDialogTarget(txItem);
    setConfirmDialogAction(actionStatus);
  };

  const handleConfirmAction = async (reason) => {
    if (!confirmDialogTarget) return;
    const txId = confirmDialogTarget._id || confirmDialogTarget.id;
    try {
      setIsConfirmLoading(true);
      const res = await adminService.updateTransactionStatus(txId, confirmDialogAction, reason);
      if (res?.success) {
        setNotification({
          type: 'success',
          message: `Transaction #${txId} status updated to ${confirmDialogAction}.`
        });
        fetchTransactions();
        if (selectedTx && (selectedTx._id === txId || selectedTx.id === txId)) {
          const detailRes = await adminService.getTransactionDetails(txId);
          if (detailRes?.success) setSelectedTx(detailRes.data.transaction || detailRes.data);
        }
      }
    } catch (err) {
      console.error('Transaction status update error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to update transaction status.'
      });
    } finally {
      setIsConfirmLoading(false);
      setConfirmDialogTarget(null);
    }
  };

  const renderTypeBadge = (type) => {
    const normType = (type || 'BORROW').toUpperCase();
    let bg = '#1e293b';
    let text = '#94a3b8';
    let icon = <ArrowRightLeft size={12} />;

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
      header: 'Transaction ID',
      accessor: 'id',
      render: (tx) => (
        <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
          #{tx.id || tx._id}
        </span>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (tx) => renderTypeBadge(tx.type)
    },
    {
      header: 'Item',
      accessor: 'item',
      render: (tx) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {tx.item?.images?.[0] ? (
            <img
              src={tx.item.images[0].url || tx.item.images[0]}
              alt=""
              style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-xs)', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <Layers size={16} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{tx.item?.title || 'Shared Product'}</span>
            {tx.item?.category && <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{tx.item.category}</span>}
          </div>
        </div>
      )
    },
    {
      header: 'Owner',
      accessor: 'owner',
      render: (tx) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={tx.owner?.avatar} name={tx.owner?.name || 'Owner'} size="xs" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f8fafc', fontSize: '0.825rem', fontWeight: 600 }}>{tx.owner?.name || 'Owner'}</span>
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{tx.owner?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Recipient',
      accessor: 'recipient',
      render: (tx) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={tx.recipient?.avatar} name={tx.recipient?.name || 'Recipient'} size="xs" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f8fafc', fontSize: '0.825rem', fontWeight: 600 }}>{tx.recipient?.name || 'Recipient'}</span>
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{tx.recipient?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (tx) => <StatusBadge status={tx.status} />
    },
    {
      header: 'Created',
      render: (tx) => (
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (tx) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleOpenDetails(tx)}
            title="Inspect transaction details"
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
            <span>Oversight</span>
          </button>

          {['PENDING', 'ACTIVE', 'IN_PROGRESS'].includes((tx.status || '').toUpperCase()) && (
            <>
              <button
                type="button"
                onClick={() => handleOpenConfirm(tx, 'COMPLETED')}
                title="Mark transaction complete"
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
                <span>Complete</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenConfirm(tx, 'CANCELLED')}
                title="Cancel transaction"
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
                <span>Cancel</span>
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
          Transactions Ledger
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Real-time PostgreSQL tracking and audit oversight of circular sharing transactions, returns, and handovers.
        </p>
      </div>

      {/* Summary Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <AdminStatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={Receipt}
          trend={{ value: 'All Ledger Entries', isPositive: true }}
        />
        <AdminStatCard
          title="Active Transactions"
          value={stats.activeTransactions}
          icon={Clock}
          trend={{ value: 'Currently Borrowed/In Progress', isPositive: true }}
        />
        <AdminStatCard
          title="Pending Transactions"
          value={stats.pendingTransactions}
          icon={Clock}
          trend={{ value: 'Awaiting Handover', isPositive: false }}
        />
        <AdminStatCard
          title="Completed Transactions"
          value={stats.completedTransactions}
          icon={CheckCircle2}
          trend={{ value: 'Successfully Returned/Finalized', isPositive: true }}
        />
        <AdminStatCard
          title="Cancelled Transactions"
          value={stats.cancelledTransactions}
          icon={XCircle}
          trend={{ value: 'Terminated/Cancelled', isPositive: false }}
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
          placeholder="Search transaction ID, request ID, user, item..."
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
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
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
          <option value="">All Transaction Types</option>
          <option value="BORROW">Borrow</option>
          <option value="REUSE">Reuse</option>
          <option value="GIVEAWAY">Giveaway</option>
          <option value="EXCHANGE">Exchange</option>
        </select>
      </AdminFilterBar>

      {/* Transactions Table */}
      <AdminTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        emptyMessage="No circular transactions match the selected criteria."
      />

      {/* Pagination */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={15}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Transaction Details Inspector Modal */}
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
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Transaction Ledger Details
                </h2>
                {selectedTx && renderTypeBadge(selectedTx.type)}
              </div>
              {selectedTx && <StatusBadge status={selectedTx.status} />}
            </div>

            {detailsLoading || !selectedTx ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <Spinner size="md" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
                {/* Item Card */}
                <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    Transacted Item
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedTx.item?.images?.[0] && (
                      <img
                        src={selectedTx.item.images[0].url || selectedTx.item.images[0]}
                        alt=""
                        style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>{selectedTx.item?.title || 'Shared Item'}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                        Category: {selectedTx.item?.category || 'General'} | Availability: {selectedTx.item?.availability || 'N/A'}
                      </span>
                      {selectedTx.item?.location && (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Location: {selectedTx.item.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner & Recipient Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                      Item Owner
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar src={selectedTx.owner?.avatar} name={selectedTx.owner?.name} size="sm" />
                      <div>
                        <span style={{ color: '#f8fafc', fontWeight: 600, display: 'block' }}>{selectedTx.owner?.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>{selectedTx.owner?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                      Recipient / Borrower
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar src={selectedTx.recipient?.avatar} name={selectedTx.recipient?.name} size="sm" />
                      <div>
                        <span style={{ color: '#f8fafc', fontWeight: 600, display: 'block' }}>{selectedTx.recipient?.name}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>{selectedTx.recipient?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Request */}
                {selectedTx.request && (
                  <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #38bdf8' }}>
                    <span style={{ color: '#38bdf8', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Associated Request
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.8rem' }}>
                      <span>Request ID: #{selectedTx.request.id || selectedTx.requestId}</span>
                      <span>Request Type: {selectedTx.request.type}</span>
                      <span>Status: {selectedTx.request.status}</span>
                    </div>
                    {selectedTx.request.message && (
                      <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '6px 0 0 0', fontStyle: 'italic' }}>
                        "{selectedTx.request.message}"
                      </p>
                    )}
                  </div>
                )}

                {/* Dates breakdown */}
                <div style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Handover Method:</span>
                    <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedTx.handoverMethod || 'In Person'}</span>
                  </div>
                  {selectedTx.expectedReturnDate && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Expected Return Date:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{new Date(selectedTx.expectedReturnDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedTx.completedAt && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Completed Date:</span>
                      <span style={{ color: '#4ade80', fontWeight: 600 }}>{new Date(selectedTx.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedTx.cancelledAt && (
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Cancelled Date:</span>
                      <span style={{ color: '#f87171', fontWeight: 600 }}>{new Date(selectedTx.cancelledAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedTx.notes && (
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block', marginBottom: '2px' }}>Transaction Notes</span>
                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.825rem' }}>{selectedTx.notes}</p>
                  </div>
                )}

                {/* Footer Timestamps */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Created: {new Date(selectedTx.createdAt).toLocaleString()}</span>
                  <span>Tx ID: #{selectedTx.id || selectedTx._id}</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {selectedTx && ['PENDING', 'ACTIVE', 'IN_PROGRESS'].includes((selectedTx.status || '').toUpperCase()) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenConfirm(selectedTx, 'COMPLETED')}
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
                      Complete Transaction
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenConfirm(selectedTx, 'CANCELLED')}
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
                      Cancel Transaction
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
          title={confirmDialogAction === 'COMPLETED' ? 'Mark Transaction Complete' : 'Cancel Transaction'}
          message={
            confirmDialogAction === 'COMPLETED'
              ? `Are you sure you want to mark transaction #${confirmDialogTarget.id || confirmDialogTarget._id} as COMPLETED? This will update item availability back to Available.`
              : `Are you sure you want to CANCEL transaction #${confirmDialogTarget.id || confirmDialogTarget._id}?`
          }
          confirmLabel={confirmDialogAction === 'COMPLETED' ? 'Mark Complete' : 'Cancel Transaction'}
          confirmVariant={confirmDialogAction === 'COMPLETED' ? 'success' : 'danger'}
          requireReason={true}
          reasonPlaceholder="Enter administrative reason for audit log..."
          isLoading={isConfirmLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmDialogTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminTransactionsPage;
