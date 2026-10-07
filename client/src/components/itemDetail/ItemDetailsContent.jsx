import React, { useState } from 'react';
import { formatDate, formatSharingType, formatCondition } from '../../utils/formatters';

export const ItemDetailsContent = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!item) return null;

  const sharingInfo = formatSharingType(item.sharingType);
  const conditionInfo = formatCondition(item.condition);

  const description = item.description || 'No detailed description provided.';
  const isLongDescription = description.length > 280;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="item-details-content">
      {/* 1. About this Item Section */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '0.6rem' }}>
          About this Item
        </h2>

        <div style={{ color: 'var(--color-slate-700)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
            {isLongDescription && !isExpanded
              ? `${description.slice(0, 280)}...`
              : description}
          </p>

          {isLongDescription && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary-700)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 0',
                marginTop: '4px',
                fontSize: '0.875rem'
              }}
              className="read-more-btn"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Structured Item Specifications Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-slate-200)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-slate-200)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-800)', margin: 0 }}>
            Item Details & Specifications
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', padding: '12px 16px', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              Category
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)', textTransform: 'capitalize' }}>
              {item.category || 'General'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              Condition
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
              {conditionInfo.label}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              Sharing Model
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
              {sharingInfo.label} ({sharingInfo.description})
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              Availability
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
              {item.availability || 'Available immediately'}
            </span>
          </div>

          {item.location && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Pickup Neighborhood
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
                {item.location}
              </span>
            </div>
          )}

          {item.createdAt && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Listed Date
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
                {formatDate(item.createdAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .read-more-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default ItemDetailsContent;
