import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import StatusBadge from '../../components/admin/StatusBadge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';

export const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Review & Resolution Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolveStatus, setResolveStatus] = useState('RESOLVED');
  const [actionTaken, setActionTaken] = useState('NO_VIOLATION');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getReports({
        page,
        limit: 15,
        status: statusFilter,
        targetType: targetTypeFilter
      });
      if (res?.success) {
        setReports(res.data.reports || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve moderation reports.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, targetTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleOpenResolve = (rep) => {
    setSelectedReport(rep);
    setResolveStatus(rep.status === 'PENDING' ? 'RESOLVED' : rep.status);
    setActionTaken(rep.actionTaken || 'NO_VIOLATION');
    setResolutionNotes(rep.resolutionNotes || '');
    setIsResolveOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!selectedReport) return;
    try {
      setIsSubmitting(true);
      const res = await adminService.resolveReport(selectedReport._id, {
        status: resolveStatus,
        actionTaken,
        resolutionNotes
      });
      if (res?.success) {
        setNotification({
          type: 'success',
          message: `Report has been updated to ${resolveStatus}.`
        });
        setIsResolveOpen(false);
        setSelectedReport(null);
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to update report resolution:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update report resolution.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Report ID',
      accessor: '_id',
      render: (r) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>
          {r._id?.slice(-8)}
        </span>
      )
    },
    {
      header: 'Reporter',
      accessor: 'reporter',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={r.reporter?.avatar} name={r.reporter?.name || 'Reporter'} size="xs" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>{r.reporter?.name || 'User'}</span>
            <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{r.reporter?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Target Type',
      accessor: 'targetType',
      render: (r) => (
        <span
          style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: '#334155',
            color: '#f8fafc'
          }}
        >
          {r.targetType}
        </span>
      )
    },
    {
      header: 'Target Entity',
      render: (r) => (
        <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.825rem' }}>
          {r.targetItem?.title || r.targetUser?.name || 'Entity'}
        </span>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}>
          <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.825rem' }}>{r.reason}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.description || 'No description provided'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Filed Date',
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
        <button
          type="button"
          onClick={() => handleOpenResolve(r)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            backgroundColor: r.status === 'PENDING' ? 'var(--color-primary-600)' : '#334155',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FileCheck size={12} />
          <span>{r.status === 'PENDING' ? 'Moderate' : 'Inspect'}</span>
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
          Moderation & Dispute Queue
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Review reported listings, investigate user safety complaints, and record auditable moderation decisions.
        </p>
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

      {/* Filter Bar */}
      <AdminFilterBar
        onReset={() => {
          setStatusFilter('');
          setTargetTypeFilter('');
          setPage(1);
        }}
        hasActiveFilters={Boolean(statusFilter || targetTypeFilter)}
      >
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
          <option value="PENDING">Pending Review</option>
          <option value="REVIEWED">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>

        <select
          value={targetTypeFilter}
          onChange={(e) => {
            setTargetTypeFilter(e.target.value);
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
          <option value="">All Target Types</option>
          <option value="USER">User Complaints</option>
          <option value="ITEM">Item Violations</option>
        </select>
      </AdminFilterBar>

      <AdminTable
        columns={columns}
        data={reports}
        isLoading={isLoading}
        emptyMessage="No moderation reports found for the selected filters."
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={15}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Report Resolution Modal */}
      {isResolveOpen && selectedReport && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="var(--color-danger)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Review Community Report
                </h2>
              </div>
              <StatusBadge status={selectedReport.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
              {/* Report Information */}
              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Reported Allegation:</span>
                  <span style={{ color: '#f87171', fontWeight: 700 }}>{selectedReport.reason}</span>
                </div>
                {selectedReport.description && (
                  <p style={{ color: '#cbd5e1', fontSize: '0.825rem', margin: 0, lineHeight: 1.4 }}>
                    "{selectedReport.description}"
                  </p>
                )}
              </div>

              {/* Target Entity Details */}
              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                  Target Entity ({selectedReport.targetType})
                </span>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                  {selectedReport.targetItem?.title || selectedReport.targetUser?.name}
                </span>
              </div>

              {/* Resolution Status Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Moderation Decision *
                </label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="REVIEWED">Mark as Under Review</option>
                  <option value="RESOLVED">Resolve Report</option>
                  <option value="DISMISSED">Dismiss Report (No Violation Found)</option>
                </select>
              </div>

              {/* Action Taken Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Action Taken *
                </label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="NO_VIOLATION">No Violation / Content Approved</option>
                  <option value="CONTENT_REMOVED">Listing Removed / Content Hidden</option>
                  <option value="USER_WARNED">User Issued Warning</option>
                  <option value="USER_SUSPENDED">User Suspended</option>
                  <option value="REPORT_DISMISSED">Report Dismissed</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Resolution Notes (Recorded in Audit Log)
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain findings and justification for this moderation outcome..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsResolveOpen(false)}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  backgroundColor: 'var(--color-primary-600)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting && <Spinner size="sm" />}
                <span>Save Resolution</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
