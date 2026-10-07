import React from 'react';
import {
  Calendar,
  Tag,
  ArrowRight,
  Repeat,
  Share2,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const ImpactHistoryTable = ({
  history = [],
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  typeFilter,
  onTypeFilterChange,
  isLoading
}) => {
  const types = [
    { label: 'All Types', val: 'all' },
    { label: 'Free Giveaways', val: 'FREE' },
    { label: 'Lending / Borrow', val: 'BORROW' },
    { label: 'Exchanges', val: 'EXCHANGE' }
  ];

  return (
    <Card style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
      {/* Header and Filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
            Contribution History
          </h2>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            Chronological audit of verified circular sharing events ({total} total)
          </p>
        </div>

        {/* Type Filter Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-slate-100)',
            padding: '3px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {types.map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => onTypeFilterChange(t.val)}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: typeFilter === t.val ? '#ffffff' : 'transparent',
                color: typeFilter === t.val ? 'var(--color-slate-900)' : 'var(--color-slate-600)',
                fontSize: '0.8rem',
                fontWeight: typeFilter === t.val ? 700 : 500,
                boxShadow: typeFilter === t.val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-slate-500)' }}>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>No impact records matching the selected filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((record) => {
            const hasFactor =
              record.co2eAvoided !== null ||
              record.wasteAvoided !== null ||
              record.waterSaved !== null;

            const dateStr = record.date
              ? new Date(record.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Completed';

            return (
              <div
                key={record.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-slate-200)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* Left: Item, Category, Type, Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: record.role === 'shared' ? '#eff6ff' : '#f0fdf4',
                      color: record.role === 'shared' ? '#2563eb' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {record.role === 'shared' ? <Share2 size={18} /> : <PackageCheck size={18} />}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                      {record.itemTitle}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Tag size={12} />
                        {record.category}
                      </span>
                      <span style={{ color: 'var(--color-slate-300)' }}>•</span>
                      <Badge variant={record.role === 'shared' ? 'primary' : 'success'} size="sm">
                        {record.role === 'shared' ? 'You Shared' : 'You Received'}
                      </Badge>
                      <span style={{ color: 'var(--color-slate-300)' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)', fontWeight: 600 }}>
                        {record.impactType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Environmental Metrics or Clear Unavailable Note */}
                <div style={{ textAlign: 'right', minWidth: '180px' }}>
                  {hasFactor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      {record.co2eAvoided !== null && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488' }}>
                          Est. {record.co2eAvoided} kg CO₂e avoided
                        </span>
                      )}
                      {record.wasteAvoided !== null && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                          Est. {record.wasteAvoided} kg waste diverted
                        </span>
                      )}
                      {record.waterSaved !== null && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                          Est. {record.waterSaved.toLocaleString()} L water saved
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: 'var(--color-slate-500)', fontSize: '0.75rem' }}>
                      <Info size={13} />
                      <span>Reuse recorded — factor not configured</span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '4px' }}>
                    {dateStr}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-slate-100)'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total records)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-slate-200)',
                backgroundColor: '#ffffff',
                color: page <= 1 ? 'var(--color-slate-300)' : 'var(--color-slate-700)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-slate-200)',
                backgroundColor: '#ffffff',
                color: page >= totalPages ? 'var(--color-slate-300)' : 'var(--color-slate-700)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ImpactHistoryTable;
