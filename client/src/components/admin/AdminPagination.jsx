import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AdminPagination = ({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 20,
  onPageChange
}) => {
  if (totalPages <= 1 && total === 0) return null;

  const startRecord = Math.min((page - 1) * limit + 1, total);
  const endRecord = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#1e293b',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #334155',
        marginTop: '1rem',
        fontSize: '0.875rem',
        color: '#94a3b8'
      }}
    >
      <div>
        Showing <span style={{ color: '#f8fafc', fontWeight: 600 }}>{startRecord}</span> to{' '}
        <span style={{ color: '#f8fafc', fontWeight: 600 }}>{endRecord}</span> of{' '}
        <span style={{ color: '#f8fafc', fontWeight: 600 }}>{total}</span> records
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: page <= 1 ? '#0f172a' : '#334155',
            color: page <= 1 ? '#475569' : '#f8fafc',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-sm)',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'all var(--transition-fast)'
          }}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <span style={{ padding: '0 8px', color: '#f8fafc', fontWeight: 600 }}>
          Page {page} of {totalPages || 1}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: page >= totalPages ? '#0f172a' : '#334155',
            color: page >= totalPages ? '#475569' : '#f8fafc',
            border: '1px solid #334155',
            borderRadius: 'var(--radius-sm)',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'all var(--transition-fast)'
          }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminPagination;
