import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, Calendar, User, Terminal, RefreshCw, Search, Filter, AlertTriangle, Activity, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import Avatar from '../../components/common/Avatar';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  // Stats & Action breakdown
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventsToday: 0,
    eventsThisMonth: 0,
    uniqueActors: 0,
    topAction: 'N/A'
  });
  const [actionsList, setActionsList] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [rangeFilter, setRangeFilter] = useState('30d');

  // Detail Inspector Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [logsRes, statsRes, actionsRes, trendRes] = await Promise.all([
        adminService.getAuditLogs({
          page,
          limit,
          search,
          action: actionFilter,
          targetType: targetTypeFilter,
          range: rangeFilter
        }),
        adminService.getAuditStats().catch(() => ({ success: false })),
        adminService.getAuditActions().catch(() => ({ success: false })),
        adminService.getAuditTrend(rangeFilter).catch(() => ({ success: false }))
      ]);

      if (logsRes?.success) {
        setLogs(logsRes.data || []);
        setTotal(logsRes.pagination?.total || 0);
        setTotalPages(logsRes.pagination?.totalPages || 1);
      }
      if (statsRes?.success) {
        setStats(statsRes.data);
      }
      if (actionsRes?.success) {
        setActionsList(actionsRes.data || []);
      }
      if (trendRes?.success) {
        setTrendData(trendRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, actionFilter, targetTypeFilter, rangeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('');
    setTargetTypeFilter('');
    setRangeFilter('30d');
    setPage(1);
  };

  const getActionBadgeColor = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('SUSPEND') || act.includes('REJECT') || act.includes('HIDE')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
    }
    if (act.includes('CREATE') || act.includes('ACTIVATE') || act.includes('APPROVE') || act.includes('CREDIT')) {
      return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
    }
    if (act.includes('UPDATE') || act.includes('SETTING') || act.includes('MODERAT')) {
      return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
    }
    return { bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' };
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (log) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: '#f8fafc', fontSize: '0.825rem', fontWeight: 600 }}>
            {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {new Date(log.createdAt).toLocaleTimeString()}
          </span>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (log) => {
        const badgeStyle = getActionBadgeColor(log.action);
        return (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: badgeStyle.color,
              backgroundColor: badgeStyle.bg,
              border: `1px solid ${badgeStyle.border}`,
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.02em'
            }}
          >
            {log.action}
          </span>
        );
      }
    },
    {
      header: 'Administrator / Actor',
      accessor: 'actor',
      render: (log) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar name={log.actor?.name || 'Admin'} size="xs" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.825rem' }}>
              {log.actor?.name || 'System Administrator'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>
              {log.actor?.email || 'admin@looop.com'} • <strong style={{ color: '#818cf8' }}>{log.actor?.role || 'ADMIN'}</strong>
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Entity / Target',
      accessor: 'targetType',
      render: (log) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: '#334155',
              color: '#38bdf8',
              letterSpacing: '0.04em'
            }}
          >
            {log.targetType}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
            {log.targetTitle || log.targetId || 'Global Setting'}
          </span>
        </div>
      )
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (log) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.775rem', color: '#64748b' }}>
          {log.ipAddress || '127.0.0.1'}
        </span>
      )
    },
    {
      header: 'Inspection',
      align: 'right',
      render: (log) => (
        <button
          type="button"
          onClick={() => setSelectedLog(log)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-sm)',
            color: '#f8fafc',
            fontSize: '0.775rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.color = '#818cf8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.color = '#f8fafc';
          }}
        >
          <Eye size={13} />
          <span>View Details</span>
        </button>
      )
    }
  ];

  // Unique target types for dropdown
  const targetTypes = ['USER', 'ITEM', 'REQUEST', 'TRANSACTION', 'POINTS', 'MESSAGE', 'NOTIFICATION', 'REPORT', 'CATEGORY', 'SETTINGS'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-md)', color: '#818cf8' }}>
              <Shield size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Security Audit Logs
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '6px', margin: 0 }}>
            Read-only, tamper-resistant record of administrative operations, security events, and platform state changes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-md)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh Audit Feed</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Audit Events</span>
            <Activity size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{stats.totalEvents}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PostgreSQL verified records</span>
        </div>

        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Events Today</span>
            <Clock size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{stats.eventsToday}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Recorded since midnight</span>
        </div>

        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Events This Month</span>
            <Calendar size={16} color="#4ade80" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4ade80' }}>{stats.eventsThisMonth}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Trailing 30-day window</span>
        </div>

        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Unique Admin Actors</span>
            <User size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>{stats.uniqueActors}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active administrative accounts</span>
        </div>
      </div>

      {/* Audit Activity & Action Trends (Visual Strip) */}
      {trendData.length > 0 && (
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 12px 0' }}>
            Audit Event Activity Timeline ({rangeFilter.toUpperCase()})
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px', overflowX: 'auto', paddingBottom: '4px' }}>
            {trendData.map((item, idx) => {
              const maxCount = Math.max(...trendData.map(t => t.count), 1);
              const pct = Math.max(15, Math.round((item.count / maxCount) * 100));
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '24px' }} title={`${item.date}: ${item.count} events`}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '2px' }}>{item.count}</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${pct}%`,
                      backgroundColor: '#6366f1',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'height 0.3s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap' }}>
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <AdminFilterBar
        onReset={handleResetFilters}
        hasActiveFilters={Boolean(search || actionFilter || targetTypeFilter || rangeFilter !== '30d')}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search action, actor, target ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-md)',
              color: '#f8fafc',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Target Type Dropdown */}
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
            borderRadius: 'var(--radius-md)',
            color: '#f8fafc',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Target Entities</option>
          {targetTypes.map((tt) => (
            <option key={tt} value={tt}>{tt}</option>
          ))}
        </select>

        {/* Action Dropdown */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-md)',
            color: '#f8fafc',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Actions</option>
          {actionsList.map((a) => (
            <option key={a.action} value={a.action}>{a.action} ({a.count})</option>
          ))}
        </select>

        {/* Date Range Dropdown */}
        <select
          value={rangeFilter}
          onChange={(e) => {
            setRangeFilter(e.target.value);
            setPage(1);
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-md)',
            color: '#f8fafc',
            fontSize: '0.85rem'
          }}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="12m">Last 12 Months</option>
          <option value="all">All Time</option>
        </select>
      </AdminFilterBar>

      {/* Main Audit Table */}
      <AdminTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="No security audit events match the selected filter criteria."
      />

      {/* Server-Side Pagination */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Detail Inspector Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
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
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={20} color="#818cf8" />
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Audit Log Detail Inspector
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    ID: {selectedLog.id}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#4ade80',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}
              >
                READ-ONLY IMMUTABLE RECORD
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Event Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Action</span>
                  <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'monospace' }}>{selectedLog.action}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Timestamp</span>
                  <span style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Target Entity Type</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>{selectedLog.targetType}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Target Identifier</span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{selectedLog.targetTitle || selectedLog.targetId || 'N/A'}</span>
                </div>
              </div>

              {/* Actor Information */}
              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Administrative Actor Details
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={selectedLog.actor?.name || 'Admin'} size="sm" />
                  <div>
                    <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>
                      {selectedLog.actor?.name || 'System Administrator'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.775rem' }}>
                      {selectedLog.actor?.email} • ID: <span style={{ fontFamily: 'monospace' }}>{selectedLog.actor?.id}</span> • Role: <span style={{ color: '#818cf8', fontWeight: 700 }}>{selectedLog.actor?.role}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.725rem', marginTop: '2px' }}>
                      IP Address: <span style={{ fontFamily: 'monospace' }}>{selectedLog.ipAddress || '127.0.0.1'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before / After Comparison Panel (if present in metadata) */}
              {(selectedLog.oldValue !== null || selectedLog.newValue !== null) ? (
                <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    State Change Snapshot (Before vs After)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: '#f87171', fontSize: '0.725rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>BEFORE</span>
                      <pre style={{ margin: 0, fontSize: '0.75rem', color: '#fca5a5', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {typeof selectedLog.oldValue === 'object' ? JSON.stringify(selectedLog.oldValue, null, 2) : String(selectedLog.oldValue ?? 'None')}
                      </pre>
                    </div>
                    <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: '#4ade80', fontSize: '0.725rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>AFTER</span>
                      <pre style={{ margin: 0, fontSize: '0.75rem', color: '#86efac', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {typeof selectedLog.newValue === 'object' ? JSON.stringify(selectedLog.newValue, null, 2) : String(selectedLog.newValue ?? 'None')}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: '#64748b', fontSize: '0.775rem' }}>
                  No explicit state change snapshot recorded for this audit entry.
                </div>
              )}

              {/* Full Sanitized JSON Metadata */}
              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Sanitized Metadata Payload (No Tokens/Passwords Exposed)
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.775rem',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    backgroundColor: '#020617',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '200px'
                  }}
                >
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#334155',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;

