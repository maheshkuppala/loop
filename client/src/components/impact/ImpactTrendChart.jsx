import React, { useState } from 'react';
import { Calendar, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

export const ImpactTrendChart = ({ trends = [], range, onRangeChange, isLoading }) => {
  const [activeMetric, setActiveMetric] = useState('itemsReused');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const ranges = [
    { label: '30 Days', val: '30d' },
    { label: '3 Months', val: '3m' },
    { label: '6 Months', val: '6m' },
    { label: '12 Months', val: '12m' },
    { label: 'All Time', val: 'all' }
  ];

  const maxVal = Math.max(...trends.map((t) => t[activeMetric] || 0), 1);

  return (
    <Card style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
      {/* Chart Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--color-primary-600)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
              Reuse Activity Over Time
            </h2>
          </div>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            Real timeline of completed circular handovers from MongoDB aggregation
          </p>
        </div>

        {/* Range Selector Pill Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-slate-100)',
            padding: '3px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {ranges.map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => onRangeChange(r.val)}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: range === r.val ? '#ffffff' : 'transparent',
                color: range === r.val ? 'var(--color-slate-900)' : 'var(--color-slate-600)',
                fontSize: '0.8rem',
                fontWeight: range === r.val ? 700 : 500,
                boxShadow: range === r.val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveMetric('itemsReused')}
          style={{
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-xs)',
            border: activeMetric === 'itemsReused' ? '1px solid var(--color-primary-600)' : '1px solid var(--color-slate-200)',
            backgroundColor: activeMetric === 'itemsReused' ? 'var(--color-primary-50)' : '#ffffff',
            color: activeMetric === 'itemsReused' ? 'var(--color-primary-700)' : 'var(--color-slate-600)',
            cursor: 'pointer'
          }}
        >
          Items Reused
        </button>
        <button
          type="button"
          onClick={() => setActiveMetric('transactionsCount')}
          style={{
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-xs)',
            border: activeMetric === 'transactionsCount' ? '1px solid var(--color-primary-600)' : '1px solid var(--color-slate-200)',
            backgroundColor: activeMetric === 'transactionsCount' ? 'var(--color-primary-50)' : '#ffffff',
            color: activeMetric === 'transactionsCount' ? 'var(--color-primary-700)' : 'var(--color-slate-600)',
            cursor: 'pointer'
          }}
        >
          Transactions Completed
        </button>
      </div>

      {/* Chart Canvas / Empty State */}
      {trends.length === 0 ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-slate-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-slate-200)'
          }}
        >
          <Calendar size={32} color="var(--color-slate-400)" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-slate-800)', margin: '0 0 6px 0' }}>
            No Completed Reuse Activity in this Period
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
            When you complete handovers with neighbors, monthly and daily activity trends will automatically render here.
          </p>
          <Link to="/browse">
            <Button variant="outline" size="sm" iconLeft={Search}>
              Browse Items
            </Button>
          </Link>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Tooltip Popup */}
          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                top: '0',
                right: '10px',
                padding: '8px 12px',
                backgroundColor: 'var(--color-slate-900)',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ fontWeight: 800, color: '#a7f3d0' }}>{hoveredPoint.label}</div>
              <div>Items Reused: <strong>{hoveredPoint.itemsReused || 0}</strong></div>
              <div>Transactions: <strong>{hoveredPoint.transactionsCount || 0}</strong></div>
              {hoveredPoint.co2eAvoided !== null && hoveredPoint.co2eAvoided !== undefined && (
                <div>Est. CO₂e Avoided: <strong>{hoveredPoint.co2eAvoided} kg</strong></div>
              )}
            </div>
          )}

          {/* Accessible Bar Chart Visualizer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
              height: '200px',
              padding: '1.5rem 0.5rem 0.5rem 0.5rem',
              borderBottom: '2px solid var(--color-slate-200)',
              overflowX: 'auto'
            }}
          >
            {trends.map((item, idx) => {
              const val = item[activeMetric] || 0;
              const heightPct = Math.max(8, Math.round((val / maxVal) * 100));

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredPoint(item)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: '1 0 36px',
                    minWidth: '36px',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-slate-700)', marginBottom: '4px' }}>
                    {val}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      height: `${heightPct}%`,
                      backgroundColor: hoveredPoint?.label === item.label ? 'var(--color-primary-700)' : 'var(--color-primary-500)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-slate-500)',
                      marginTop: '6px',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      maxWidth: '48px',
                      textAlign: 'center'
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ImpactTrendChart;
