import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Award,
  Eye,
  CheckCircle,
  AlertCircle,
  Users,
  CreditCard,
  PlusCircle,
  MinusCircle,
  Search
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import AdminStatCard from '../../components/admin/AdminStatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';

export const AdminPointsPage = () => {
  const [ledger, setLedger] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState({
    totalPointsInCirculation: 0,
    pointsEarned: 0,
    pointsSpent: 0,
    totalLedgerEntries: 0,
    usersWithPoints: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Entry Details Modal State
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Admin Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [userSearchText, setUserSearchText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'deduct'
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [userSearching, setUserSearching] = useState(false);

  const fetchLedger = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getPointsLedger({
        page,
        limit: 15,
        search,
        type: typeFilter
      });
      if (res?.success) {
        const ledgerData = res.data.ledger || res.data.history || [];
        setLedger(ledgerData);
        setTotal(res.data.total || ledgerData.length || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load points ledger:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve points ledger from database.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleOpenDetails = async (entryItem) => {
    setIsDetailsOpen(true);
    const entryId = entryItem._id || entryItem.id;
    try {
      setDetailsLoading(true);
      const res = await adminService.getPointsEntryDetails(entryId);
      if (res?.success) {
        setSelectedEntry(res.data);
      } else {
        setSelectedEntry(entryItem);
      }
    } catch (err) {
      console.error('Failed to fetch points entry details:', err);
      setSelectedEntry(entryItem);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSearchUsers = async (queryText) => {
    setUserSearchText(queryText);
    if (!queryText.trim()) {
      setUsersList([]);
      return;
    }
    try {
      setUserSearching(true);
      const res = await adminService.getUsers({ search: queryText, limit: 5 });
      if (res?.success) {
        setUsersList(res.data.users || []);
      }
    } catch (err) {
      console.error('User search error:', err);
    } finally {
      setUserSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id || user._id);
    setSelectedUserData(user);
    setUsersList([]);
    setUserSearchText(`${user.name} (${user.email})`);
  };

  const handlePerformAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setNotification({ type: 'error', message: 'Please select a valid target user.' });
      return;
    }

    const numericVal = parseInt(adjustAmount, 10);
    if (isNaN(numericVal) || numericVal <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid positive points amount.' });
      return;
    }

    if (!adjustReason.trim()) {
      setNotification({ type: 'error', message: 'Adjustment reason is required for administrative audit logging.' });
      return;
    }

    const finalDelta = adjustType === 'deduct' ? -numericVal : numericVal;

    try {
      setIsAdjusting(true);
      const res = await adminService.adjustUserPoints(selectedUserId, finalDelta, adjustReason.trim());
      if (res?.success) {
        setNotification({
          type: 'success',
          message: `Successfully ${finalDelta > 0 ? 'credited' : 'deducted'} ${Math.abs(finalDelta)} points for ${selectedUserData?.name || 'user'}.`
        });
        setShowAdjustModal(false);
        setSelectedUserId('');
        setSelectedUserData(null);
        setUserSearchText('');
        setAdjustAmount('');
        setAdjustReason('');
        fetchLedger();
      }
    } catch (err) {
      console.error('Points adjustment error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to adjust user points.'
      });
    } finally {
      setIsAdjusting(false);
    }
  };

  const columns = [
    {
      header: 'Ledger ID',
      accessor: 'id',
      render: (r) => (
        <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
          #{r.id || r._id}
        </span>
      )
    },
    {
      header: 'Customer / User',
      accessor: 'user',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={r.user?.avatar} name={r.user?.name || 'User'} size="xs" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f8fafc', fontSize: '0.825rem', fontWeight: 600 }}>{r.user?.name || 'User'}</span>
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{r.user?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Points Delta',
      accessor: 'amount',
      render: (r) => {
        const amt = r.amount ?? 0;
        const isPositive = amt >= 0;
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: isPositive ? '#4ade80' : '#f87171',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{isPositive ? `+${amt}` : amt} pts</span>
          </span>
        );
      }
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (r) => (
        <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
          {r.type?.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Reason / Action',
      accessor: 'reason',
      render: (r) => (
        <span style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>{r.reason || 'Points entry'}</span>
      )
    },
    {
      header: 'Balance After',
      accessor: 'balanceAfter',
      render: (r) => (
        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.825rem' }}>
          {r.balanceAfter ?? '—'} pts
        </span>
      )
    },
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (r) => (
        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
          {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => handleOpenDetails(r)}
          title="Inspect ledger entry"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
            Points Engine
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Monitor community points in circulation, search ledger entries, inspect credit/debit activity, and safely perform administrative point adjustments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdjustModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: '#0284c7',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Award size={18} />
          <span>Adjust User Points</span>
        </button>
      </div>

      {/* Summary Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <AdminStatCard
          title="Total Points in Circulation"
          value={stats.totalPointsInCirculation}
          icon={Coins}
          trend={{ value: 'Live Balance', isPositive: true }}
        />
        <AdminStatCard
          title="Points Earned"
          value={stats.pointsEarned}
          icon={ArrowUpRight}
          trend={{ value: 'Total Credited', isPositive: true }}
        />
        <AdminStatCard
          title="Points Spent / Deducted"
          value={stats.pointsSpent}
          icon={ArrowDownRight}
          trend={{ value: 'Total Debited', isPositive: false }}
        />
        <AdminStatCard
          title="Total Ledger Entries"
          value={stats.totalLedgerEntries}
          icon={History}
          trend={{ value: 'Audit Records', isPositive: true }}
        />
        <AdminStatCard
          title="Users With Points"
          value={stats.usersWithPoints}
          icon={Users}
          trend={{ value: 'Active Holders', isPositive: true }}
        />
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        onReset={() => {
          setSearch('');
          setTypeFilter('');
          setPage(1);
        }}
        hasActiveFilters={Boolean(search || typeFilter)}
      >
        <AdminSearch
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search user, ledger ID, reason..."
        />

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
          <option value="">All Ledger Types</option>
          <option value="CREDIT">Credits (+)</option>
          <option value="DEBIT">Debits (-)</option>
          <option value="ADMIN_CREDIT">Admin Credit</option>
          <option value="ADMIN_DEBIT">Admin Debit</option>
        </select>
      </AdminFilterBar>

      {/* Points Ledger Table */}
      <AdminTable
        columns={columns}
        data={ledger}
        isLoading={isLoading}
        emptyMessage="No points ledger records match the selected criteria."
      />

      {/* Pagination */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={15}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Detailed Entry Inspector Modal */}
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
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Points Ledger Inspector
              </h2>
              {selectedEntry && (
                <span
                  style={{
                    padding: '4px 10px',
                    backgroundColor: selectedEntry.amount >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: selectedEntry.amount >= 0 ? '#4ade80' : '#f87171',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}
                >
                  {selectedEntry.amount >= 0 ? `+${selectedEntry.amount}` : selectedEntry.amount} pts
                </span>
              )}
            </div>

            {detailsLoading || !selectedEntry ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <Spinner size="md" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
                {/* User Card */}
                <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    Target Account User
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar src={selectedEntry.user?.avatar} name={selectedEntry.user?.name} size="sm" />
                    <div>
                      <span style={{ color: '#f8fafc', fontWeight: 700, display: 'block' }}>{selectedEntry.user?.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block' }}>{selectedEntry.user?.email}</span>
                      <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                        Current Balance: {selectedEntry.user?.points ?? 0} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Entry Details Card */}
                <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Ledger ID:</span>
                    <span style={{ color: '#f8fafc', fontFamily: 'monospace', fontWeight: 600 }}>#{selectedEntry.id}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Entry Type:</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>{selectedEntry.type}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Amount Delta:</span>
                    <span style={{ color: selectedEntry.amount >= 0 ? '#4ade80' : '#f87171', fontWeight: 800 }}>
                      {selectedEntry.amount >= 0 ? `+${selectedEntry.amount}` : selectedEntry.amount} pts
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Balance After Entry:</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>{selectedEntry.balanceAfter ?? '—'} pts</span>
                  </div>
                </div>

                {/* Reason */}
                {selectedEntry.reason && (
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      Reason / Description
                    </span>
                    <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.85rem' }}>{selectedEntry.reason}</p>
                  </div>
                )}

                {/* Linked Transaction / Item */}
                {selectedEntry.transaction && (
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #38bdf8' }}>
                    <span style={{ color: '#38bdf8', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                      Linked Transaction
                    </span>
                    <span style={{ color: '#f8fafc', fontSize: '0.8rem' }}>
                      Tx ID: #{selectedEntry.transaction.id} | Type: {selectedEntry.transaction.type} | Status: {selectedEntry.transaction.status}
                    </span>
                  </div>
                )}

                {/* Timestamps */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  <span>Created: {new Date(selectedEntry.createdAt).toLocaleString()}</span>
                </div>
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

      {/* Administrative Points Adjustment Dialog */}
      {showAdjustModal && (
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 16px 0' }}>
              Administrative Points Adjustment
            </h2>

            <form onSubmit={handlePerformAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* User Selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Select Target User
                </label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 'var(--radius-sm)', padding: '0 10px' }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    required
                    value={userSearchText}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    placeholder="Search user by name or email..."
                    style={{
                      width: '100%',
                      padding: '10px 8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                  {userSearching && <Spinner size="xs" />}
                </div>

                {usersList.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 'var(--radius-sm)',
                      zIndex: 10,
                      maxHeight: '160px',
                      overflowY: 'auto',
                      marginTop: '4px'
                    }}
                  >
                    {usersList.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar src={u.avatar} name={u.name} size="xs" />
                          <div>
                            <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.825rem', display: 'block' }}>{u.name}</span>
                            <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>{u.email}</span>
                          </div>
                        </div>
                        <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem' }}>{u.points ?? 0} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Balance Preview */}
              {selectedUserData && (
                <div style={{ backgroundColor: '#0f172a', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Selected: <strong style={{ color: '#f8fafc' }}>{selectedUserData.name}</strong></span>
                  <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem' }}>Current Balance: {selectedUserData.points ?? 0} pts</span>
                </div>
              )}

              {/* Action Type: Add / Deduct */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Adjustment Action
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: adjustType === 'add' ? 'rgba(34, 197, 94, 0.2)' : '#0f172a',
                      border: `1px solid ${adjustType === 'add' ? '#22c55e' : '#334155'}`,
                      color: adjustType === 'add' ? '#4ade80' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <PlusCircle size={16} />
                    <span>Credit (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('deduct')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: adjustType === 'deduct' ? 'rgba(239, 68, 68, 0.2)' : '#0f172a',
                      border: `1px solid ${adjustType === 'deduct' ? '#ef4444' : '#334155'}`,
                      color: adjustType === 'deduct' ? '#f87171' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <MinusCircle size={16} />
                    <span>Deduct (-)</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Points Amount
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 50"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Live Balance Preview */}
              {selectedUserData && adjustAmount && !isNaN(parseInt(adjustAmount, 10)) && (
                <div style={{ backgroundColor: '#0f172a', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <span>Preview New Balance: </span>
                  <strong style={{ color: adjustType === 'add' ? '#4ade80' : '#f87171' }}>
                    {(selectedUserData.points ?? 0) + (adjustType === 'deduct' ? -parseInt(adjustAmount, 10) : parseInt(adjustAmount, 10))} pts
                  </strong>
                </div>
              )}

              {/* Reason Input */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Audit Log Reason (Required)
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Administrative community contribution award"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Dialog Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedUserId('');
                    setSelectedUserData(null);
                  }}
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
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAdjusting}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: adjustType === 'add' ? '#047857' : '#dc2626',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isAdjusting ? 'Processing...' : `Confirm ${adjustType === 'add' ? 'Credit' : 'Deduction'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPointsPage;
