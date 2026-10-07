import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, Calendar, User, Terminal } from 'lucide-react';
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
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Metadata Inspector Modal State
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getAuditLogs({
        page,
        limit: 20,
        targetType: targetTypeFilter
      });
      if (res?.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, targetTypeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (log) => (
        <span style={{ color: '#cbd5e1', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          {new Date(log.createdAt).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Administrator',
      accessor: 'admin',
      render: (log) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={log.admin?.avatar} name={log.admin?.name || 'Admin'} size="xs" />
          <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.825rem' }}>
            {log.admin?.name || 'System Admin'}
          </span>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (log) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#818cf8',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)'
          }}
        >
          {log.action}
        </span>
      )
    },
    {
      header: 'Target Type',
      accessor: 'targetType',
      render: (log) => (
        <span
          style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: '#334155',
            color: '#cbd5e1'
          }}
        >
          {log.targetType}
        </span>
      )
    },
    {
      header: 'Target Identifier',
      render: (log) => (
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
          {log.targetTitle || log.targetId || 'Global Setting'}
        </span>
      )
    },
    {
      header: 'Metadata',
      align: 'right',
      render: (log) => (
        <button
          type="button"
          onClick={() => setSelectedLog(log)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: '#334155',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            color: '#cbd5e1',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <Eye size={12} />
          <span>Payload</span>
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
          Administrative Security Audit Trail
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          Immutable ledger of administrative actions, user suspensions, listing moderations, and platform configurations.
        </p>
      </div>

      <AdminFilterBar
        onReset={() => {
          setTargetTypeFilter('');
          setPage(1);
        }}
        hasActiveFilters={Boolean(targetTypeFilter)}
      >
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
          <option value="USER">User Events</option>
          <option value="ITEM">Listing Events</option>
          <option value="REPORT">Moderation Events</option>
          <option value="CATEGORY">Category Events</option>
          <option value="SETTINGS">Configuration Changes</option>
        </select>
      </AdminFilterBar>

      <AdminTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="No audit logs recorded for the selected filter."
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={20}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Metadata Inspector Modal */}
      {selectedLog && (
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
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Terminal size={18} color="var(--color-primary-400)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Audit Log Payload
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Action & Target</span>
                <span style={{ color: '#818cf8', fontWeight: 600 }}>{selectedLog.action}</span>
                <span style={{ color: '#cbd5e1' }}> on {selectedLog.targetType} ({selectedLog.targetTitle || selectedLog.targetId})</span>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '6px' }}>Sanitized Metadata</span>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.775rem',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Actor: {selectedLog.admin?.email}</span>
                <span>Date: {new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
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
    </div>
  );
};

export default AdminAuditLogsPage;
