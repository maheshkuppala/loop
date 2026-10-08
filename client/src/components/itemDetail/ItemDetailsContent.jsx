import React, { useState } from 'react';
import { Sparkles, Clock, Repeat, HeartHandshake, ShieldCheck, Tag } from 'lucide-react';
import { formatDate, formatSharingType, formatCondition } from '../../utils/formatters';

export const ItemDetailsContent = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!item) return null;

  const sharingInfo = formatSharingType(item.sharingType);
  const conditionInfo = formatCondition(item.condition);

  const description = item.description || 'No detailed description provided.';
  const isLongDescription = description.length > 280;

  // Derive "How can you reuse this?" details
  const getReuseDetails = () => {
    const type = (item.sharingType || '').toLowerCase();
    if (type === 'borrow') {
      const days = item.borrowSettings?.maxDurationDays || 14;
      const unit = item.borrowSettings?.maxDurationUnit || 'days';
      return {
        icon: Clock,
        color: '#0284c7',
        bg: '#eff6ff',
        border: '#bfdbfe',
        title: 'Borrowing Rules',
        description: `This item is available to borrow for up to ${days} ${unit}. Please take good care of it and coordinate a prompt return with the owner.`
      };
    }
    if (type === 'exchange') {
      const wanted = item.exchangeDetails?.wantedItems;
      return {
        icon: Repeat,
        color: '#b45309',
        bg: '#fffbeb',
        border: '#fde68a',
        title: 'Exchange Details',
        description: wanted
          ? `The owner is looking to trade this item for: "${wanted}". Select an item from your collection when submitting a request.`
          : 'The owner is open to exchanging this item for another useful item from your collection.'
      };
    }
    if (type === 'low_cost') {
      return {
        icon: Tag,
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        title: 'Low-Cost Share',
        description: 'Offered at a minimal community price to cover basic maintenance or wear. Safe handover code ensures verification upon receipt.'
      };
    }
    // Default: give_away / free
    return {
      icon: HeartHandshake,
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      title: 'Free Community Share',
      description: 'This item is shared 100% free of cost! Send a request explaining how it will be useful to you, and arrange pickup with the owner.'
    };
  };

  const reuseInfo = getReuseDetails();
  const ReuseIcon = reuseInfo.icon;

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
                color: '#059669',
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

      {/* 2. "How can you reuse this?" Section */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: reuseInfo.bg,
          border: `1.5px solid ${reuseInfo.border}`,
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: reuseInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            <ReuseIcon size={18} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
            How can you reuse this? ({reuseInfo.title})
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', margin: 0, lineHeight: 1.6 }}>
          {reuseInfo.description}
        </p>

        {item.borrowSettings?.notes && (
          <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
            Note from owner: "{item.borrowSettings.notes}"
          </div>
        )}
      </div>

      {/* 3. Structured Item Specifications Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-slate-200)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-slate-200)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-800)', margin: 0 }}>
            Item Details & Specifications
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: '16px', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              Category
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)', textTransform: 'capitalize' }}>
              {item.category || 'General'} {item.subcategory ? `• ${item.subcategory}` : ''}
            </span>
          </div>

          {item.brand && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Brand / Make
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
                {item.brand}
              </span>
            </div>
          )}

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
                {typeof item.location === 'string' ? item.location : (item.location?.locality || item.location?.city || 'Local Area')}
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
