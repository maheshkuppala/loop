import React from 'react';

/**
 * LineTrendChart: Lightweight SVG Area / Line Chart
 * Renders real time-series data without heavy external chart packages.
 */
export const LineTrendChart = ({
  data = [], // [{ date: '2026-09-01', count: 5 }]
  title = 'Trend',
  color = 'var(--color-primary-400)',
  height = 180,
  emptyMessage = 'No activity recorded in this time range.'
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed #334155'
        }}
      >
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{emptyMessage}</span>
      </div>
    );
  }

  const counts = data.map((d) => d.count);
  const max = Math.max(...counts, 1);
  const min = 0;
  const paddingX = 40;
  const paddingY = 24;
  const width = 600;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.count - min) / (max - min)) * (height - paddingY * 2);
    return { x, y, count: d.count, date: d.date };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ''
  );

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" />
        <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#334155" />

        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${title.replace(/\s+/g, '')})`} />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={pt.y} r="4" fill="#0f172a" stroke={color} strokeWidth="2" />
          </g>
        ))}

        {/* Date labels (first and last) */}
        {points.length > 0 && (
          <>
            <text x={points[0].x} y={height - 6} fill="#64748b" fontSize="10" textAnchor="start">
              {points[0].date}
            </text>
            <text x={points[points.length - 1].x} y={height - 6} fill="#64748b" fontSize="10" textAnchor="end">
              {points[points.length - 1].date}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

/**
 * BarDistributionChart: Horizontal distribution bars
 */
export const BarDistributionChart = ({
  items = [], // [{ label: 'Books', count: 12 }]
  color = 'var(--color-primary-400)',
  emptyMessage = 'No distribution data.'
}) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        {emptyMessage}
      </div>
    );
  }

  const total = items.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item, idx) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const widthPct = Math.round((item.count / max) * 100);

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 500, textTransform: 'capitalize' }}>
                {item.label}
              </span>
              <span style={{ color: '#94a3b8' }}>
                {item.count} ({pct}%)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#0f172a',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
