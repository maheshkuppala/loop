import React from 'react';
import { Package, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Card from '../common/Card';

export const MyItemsSummaryCards = ({ summary = {}, loading = false }) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Items Shared',
      value: summary.total ?? 0,
      icon: Package,
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0'
    },
    {
      id: 'available',
      label: 'Active & Available',
      value: summary.available ?? 0,
      icon: CheckCircle2,
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd'
    },
    {
      id: 'pending',
      label: 'Pending Requests / Review',
      value: summary.pending ?? 0,
      icon: Clock,
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a'
    },
    {
      id: 'completed',
      label: 'Completed Reuses',
      value: summary.completed ?? 0,
      icon: Sparkles,
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe'
    }
  ];

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ width: '80px', height: '12px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
            </div>
            <div style={{ width: '48px', height: '28px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} className="animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-slate-200)',
              padding: '1.25rem',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
            className="my-items-stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-slate-500)' }}>
                {card.label}
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color
                }}
              >
                <Icon size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-slate-900)', lineHeight: 1 }}>
                {card.value}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', fontWeight: 500 }}>
                {card.value === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        );
      })}

      <style>{`
        .my-items-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default MyItemsSummaryCards;
