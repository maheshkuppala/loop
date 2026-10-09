import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  User,
  Package,
  FileText,
  AlertCircle,
  X,
  Sliders,
  Scale,
  UserX,
  Trash2,
  MessageSquare,
  Check,
  Search
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminPagination from '../../components/admin/AdminPagination';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export const AdminReportsPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'disputes'
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    critical: 0,
    today: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Selected Report Inspector / Resolution Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  // Resolution Form State
  const [resolveForm, setResolveForm] = useState({
    status: 'RESOLVED',
    actionTaken: 'WARNING_ISSUED',
    userAction: 'NONE',
    resolutionNotes: ''
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Status Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    reportId: null,
    actionType: null, // 'UNDER_REVIEW' | 'DISMISS'
    title: '',
    message: ''
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If activeTab === 'disputes', filter targetType for TRANSACTION or REQUEST
      const effectiveTargetType = activeTab === 'disputes' ? 'TRANSACTION' : targetTypeFilter;

      const res = await adminService.getReports({
        page,
        limit,
        search,
        status: statusFilter,
        targetType: effectiveTargetType,
        severity: severityFilter,
        dateRange: dateFilter
      });

      if (res && res.success) {
        setReports(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || 0);
        }
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports list:', err);
      setError(err.response?.data?.message || 'Failed to fetch platform reports.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, targetTypeFilter, severityFilter, dateFilter, activeTab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleInspectReport = async (id) => {
    try {
      setInspectorLoading(true);
      const res = await adminService.getReportDetails(id);
      if (res && res.success) {
        setSelectedReport(res.data);
        setResolveForm({
          status: res.data.status === 'PENDING' ? 'RESOLVED' : res.data.status,
          actionTaken: res.data.actionTaken || 'WARNING_ISSUED',
          userAction: 'NONE',
          resolutionNotes: res.data.resolutionNotes || ''
        });
      }
    } catch (err) {
      console.error('Failed to inspect report:', err);
    } finally {
      setInspectorLoading(false);
    }
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolveForm.resolutionNotes.trim()) {
      setError('Resolution notes / justification are required for audit trail logging.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleExecuteResolution = async () => {
    if (!selectedReport) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await adminService.resolveReport(selectedReport.id, {
        status: resolveForm.status,
        actionTaken: resolveForm.actionTaken,
        userAction: resolveForm.userAction,
        resolutionNotes: resolveForm.resolutionNotes.trim()
      });

      if (res && res.success) {
        setSuccessMessage('Report resolution saved and audit entry logged.');
        setSelectedReport(res.data);
        setConfirmOpen(false);
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to resolve report:', err);
      setError(err.response?.data?.message || 'Failed to save report resolution.');
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleOpenQuickAction = (report, actionType) => {
    const titles = {
      UNDER_REVIEW: 'Move Report to Under Review',
      DISMISS: 'Dismiss Moderation Report'
    };
    const messages = {
      UNDER_REVIEW: `Are you sure you want to mark report #${report.id} as UNDER REVIEW?`,
      DISMISS: `Are you sure you want to DISMISS report #${report.id}? No penalty will be applied to target entity.`
    };
    setActionModal({
      isOpen: true,
      reportId: report.id,
      actionType,
      title: titles[actionType] || 'Confirm Action',
      message: messages[actionType] || 'Proceed with this administrative status update?'
    });
  };

  const handleExecuteQuickAction = async () => {
    const { reportId, actionType } = actionModal;
    if (!reportId || !actionType) return;
    try {
      setLoading(true);
      let res;
      if (actionType === 'DISMISS') {
        res = await adminService.dismissReport(reportId, 'Dismissed by administrator from dashboard');
      } else {
        res = await adminService.updateReportStatus(reportId, actionType, 'Marked under review by administrator');
      }

      if (res && res.success) {
        setSuccessMessage(`Report updated cleanly to ${actionType}.`);
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport(res.data);
        }
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to execute quick action:', err);
      setError(err.response?.data?.message || 'Status update failed.');
    } finally {
      setActionModal({ isOpen: false, reportId: null, actionType: null, title: '', message: '' });
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
            <Scale size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              Reports & Disputes Oversight
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
              Investigate community safety complaints, listing violations, and circular sharing transaction disputes in PostgreSQL.
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
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

      {/* Real-time PostgreSQL Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <AdminStatCard title="Total Reports" value={stats.total.toLocaleString()} icon={AlertTriangle} color="#f87171" />
        <AdminStatCard title="Pending Review" value={stats.pending.toLocaleString()} icon={Clock} color="#fbbf24" />
        <AdminStatCard title="Under Investigation" value={stats.underReview.toLocaleString()} icon={Eye} color="#38bdf8" />
        <AdminStatCard title="Resolved Disputes" value={stats.resolved.toLocaleString()} icon={CheckCircle2} color="#34d399" />
        <AdminStatCard title="High / Critical" value={stats.critical.toLocaleString()} icon={Shield} color="#c084fc" />
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', gap: '1.5rem', marginBottom: '-0.5rem' }}>
        <button
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          style={{
            padding: '12px 4px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'all' ? '#f87171' : '#94a3b8',
            borderBottom: activeTab === 'all' ? '2px solid #f87171' : '2px solid transparent',
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
          <AlertTriangle size={18} />
          <span>All Community Reports ({totalCount})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('disputes');
            setPage(1);
          }}
          style={{
            padding: '12px 4px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'disputes' ? '#f87171' : '#94a3b8',
            borderBottom: activeTab === 'disputes' ? '2px solid #f87171' : '2px solid transparent',
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
          <Scale size={18} />
          <span>Transaction & Request Disputes</span>
        </button>
      </div>

      {/* Reports Feed Table Box */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '280px', maxWidth: '420px' }}>
            <AdminSearch
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search report ID, reason, description, reporter, target..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
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
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>

            {/* Target Type Filter */}
            {activeTab === 'all' && (
              <select
                value={targetTypeFilter}
                onChange={(e) => {
                  setTargetTypeFilter(e.target.value);
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
                <option value="ALL">All Targets</option>
                <option value="USER">User Complaints</option>
                <option value="ITEM">Item Violations</option>
                <option value="TRANSACTION">Transaction Disputes</option>
                <option value="REQUEST">Request Disputes</option>
              </select>
            )}

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
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
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Date Range Filter */}
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

        {/* Reports Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Report ID</th>
                <th style={{ padding: '12px 16px' }}>Reporter Profile</th>
                <th style={{ padding: '12px 16px' }}>Target Entity</th>
                <th style={{ padding: '12px 16px' }}>Allegation & Description</th>
                <th style={{ padding: '12px 16px' }}>Severity</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Filed Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <span>Loading PostgreSQL moderation report feed...</span>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No reports or disputes found for the selected filter criteria.
                  </td>
                </tr>
              ) : (
                reports.map((item) => (
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
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      #{item.id}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#e2e8f0', fontSize: '0.8rem' }}>
                          {(item.reporter?.name?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>{item.reporter?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.reporter?.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                          {item.targetType}
                        </span>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem' }}>
                          {item.targetItem?.title || item.targetUser?.name || `#${item.id}`}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                      <div style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>{item.reason}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description || 'No additional description provided.'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor:
                            item.severity === 'CRITICAL' || item.severity === 'HIGH'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : item.severity === 'MEDIUM'
                              ? 'rgba(251, 191, 36, 0.15)'
                              : 'rgba(56, 189, 248, 0.15)',
                          color:
                            item.severity === 'CRITICAL' || item.severity === 'HIGH'
                              ? '#f87171'
                              : item.severity === 'MEDIUM'
                              ? '#fbbf24'
                              : '#38bdf8',
                          border: `1px solid ${
                            item.severity === 'CRITICAL' || item.severity === 'HIGH'
                              ? 'rgba(239, 68, 68, 0.3)'
                              : item.severity === 'MEDIUM'
                              ? 'rgba(251, 191, 36, 0.3)'
                              : 'rgba(56, 189, 248, 0.3)'
                          }`
                        }}
                      >
                        {item.severity || 'MEDIUM'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={item.status} />
                    </td>

                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleInspectReport(item.id)}
                          title="Inspect Details & Moderate"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: item.status === 'PENDING' ? '#f87171' : '#1e293b',
                            border: item.status === 'PENDING' ? 'none' : '1px solid #334155',
                            color: item.status === 'PENDING' ? '#0f172a' : '#38bdf8',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={14} />
                          <span>{item.status === 'PENDING' ? 'Review & Resolve' : 'Inspect'}</span>
                        </button>

                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => handleOpenQuickAction(item, 'UNDER_REVIEW')}
                            title="Move to Under Review"
                            style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fbbf24', cursor: 'pointer' }}
                          >
                            <Clock size={16} />
                          </button>
                        )}

                        {item.status !== 'DISMISSED' && item.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleOpenQuickAction(item, 'DISMISS')}
                            title="Dismiss Report"
                            style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer' }}
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

      {/* REPORT INSPECTOR & RESOLUTION MODAL */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Report & Dispute Moderation Inspector
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>
                  {selectedReport.reason}
                </h2>
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Report Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Report ID</span>
                <div style={{ fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>#{selectedReport.id}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Target Type</span>
                <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>{selectedReport.targetType}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Status</span>
                <div><StatusBadge status={selectedReport.status} /></div>
              </div>
            </div>

            {/* Reporter vs Target Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Reporter */}
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Reporting User
                </span>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{selectedReport.reporter?.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedReport.reporter?.email}</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px', fontWeight: 600 }}>
                  Trust Score: {selectedReport.reporter?.trustScore || 0}%
                </div>
              </div>

              {/* Target Entity */}
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Target {selectedReport.targetType}
                </span>
                {selectedReport.targetUser && (
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{selectedReport.targetUser.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedReport.targetUser.email}</div>
                  </div>
                )}
                {selectedReport.targetItem && (
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{selectedReport.targetItem.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Category: {selectedReport.targetItem.category}</div>
                  </div>
                )}
                {!selectedReport.targetUser && !selectedReport.targetItem && (
                  <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}>Entity ID: {selectedReport.id}</div>
                )}
              </div>
            </div>

            {/* Allegation Description */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                Detailed Complaint Description
              </span>
              <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                "{selectedReport.description || 'No detailed text description submitted.'}"
              </div>
            </div>

            {/* Existing Resolution Notes if already resolved */}
            {selectedReport.resolutionNotes && (
              <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Recorded Moderation Resolution
                </span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0' }}>
                  {selectedReport.resolutionNotes} (Action: {selectedReport.actionTaken})
                </p>
              </div>
            )}

            {/* RESOLUTION ACTION FORM */}
            <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                Record Administrative Resolution Decision
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Moderation Outcome Status
                  </label>
                  <select
                    value={resolveForm.status}
                    onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.85rem' }}
                  >
                    <option value="RESOLVED">RESOLVED (Action Taken)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (Investigation Open)</option>
                    <option value="DISMISSED">DISMISSED (No Violation)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Recorded Action Label
                  </label>
                  <select
                    value={resolveForm.actionTaken}
                    onChange={(e) => setResolveForm({ ...resolveForm, actionTaken: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.85rem' }}
                  >
                    <option value="WARNING_ISSUED">WARNING_ISSUED</option>
                    <option value="CONTENT_REMOVED">CONTENT_REMOVED</option>
                    <option value="USER_SUSPENDED">USER_SUSPENDED</option>
                    <option value="NO_VIOLATION">NO_VIOLATION</option>
                  </select>
                </div>
              </div>

              {/* Optional User/Item Automatic State Action */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Execute Entity Moderation Action
                </label>
                <select
                  value={resolveForm.userAction}
                  onChange={(e) => setResolveForm({ ...resolveForm, userAction: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.85rem' }}
                >
                  <option value="NONE">NONE — Record Resolution Only</option>
                  {selectedReport.targetUser && (
                    <option value="SUSPEND_USER">SUSPEND_USER — Suspend Reported User Account</option>
                  )}
                  {selectedReport.targetItem && (
                    <option value="REMOVE_ITEM">REMOVE_ITEM — Remove Reported Listing Item</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Resolution Notes (Audit Trail Justification) *
                </label>
                <textarea
                  value={resolveForm.resolutionNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                  rows={3}
                  placeholder="Explain findings, evidence inspected, and administrative justification..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  style={{ padding: '10px 18px', borderRadius: '8px', backgroundColor: '#334155', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#f87171', color: '#0f172a', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Resolution Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION BEFORE EXECUTING RESOLUTION */}
      {confirmOpen && (
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Confirm Report Resolution Decision"
          message={`Are you sure you want to execute resolution "${resolveForm.status}" with action "${resolveForm.actionTaken}" for report #${selectedReport?.id}? An entry will be permanently logged in PostgreSQL admin_audit_logs.`}
          confirmLabel="Execute Resolution"
          confirmVariant="danger"
          onConfirm={handleExecuteResolution}
          onCancel={() => setConfirmOpen(false)}
          loading={submitting}
        />
      )}

      {/* QUICK STATUS ACTION MODAL */}
      {actionModal.isOpen && (
        <ConfirmDialog
          isOpen={actionModal.isOpen}
          title={actionModal.title}
          message={actionModal.message}
          confirmLabel="Execute Action"
          confirmVariant="primary"
          onConfirm={handleExecuteQuickAction}
          onCancel={() => setActionModal({ isOpen: false, reportId: null, actionType: null, title: '', message: '' })}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AdminReportsPage;
