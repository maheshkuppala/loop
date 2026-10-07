import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Repeat,
  Gift,
  HeartHandshake,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  Inbox
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const MyItemManagementCard = ({
  item,
  onToggleAvailability,
  onRequestDelete,
  isToggling = false
}) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const itemId = item._id || item.id;
  const title = item.title || 'Untitled Listing';
  const category = item.category || 'Other';
  const subcategory = item.subcategory || '';
  const condition = item.condition || 'good';
  const sharingType = item.sharingType || 'give_away';
  const availability = item.availability || (item.status === 'AVAILABLE' ? 'Available' : 'Unavailable');
  const isAvailable = availability === 'Available' || availability === 'Available now';

  // Primary Image fallback
  const primaryImage =
    item.images && item.images.length > 0
      ? typeof item.images[0] === 'string'
        ? item.images[0]
        : item.images[0].url
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

  // Relative formatted date
  const createdDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const conditionVariants = {
    new: { label: 'New', variant: 'success' },
    like_new: { label: 'Like New', variant: 'info' },
    good: { label: 'Good', variant: 'warning' },
    fair: { label: 'Fair', variant: 'secondary' },
    needs_repair: { label: 'Needs Repair', variant: 'danger' }
  };

  const sharingTypeLabels = {
    free: { label: 'Free', icon: HeartHandshake, color: '#047857', bg: '#ecfdf5' },
    give_away: { label: 'Give Away', icon: Gift, color: '#059669', bg: '#ecfdf5' },
    borrow: { label: 'Borrow', icon: Clock, color: '#0369a1', bg: '#f0f9ff' },
    exchange: { label: 'Exchange', icon: Repeat, color: '#b45309', bg: '#fffbeb' }
  };

  const sharingMeta = sharingTypeLabels[sharingType] || sharingTypeLabels.give_away;
  const SharingIcon = sharingMeta.icon;
  const conditionMeta = conditionVariants[condition] || conditionVariants.good;

  // Requests count indicator
  const requestsCount = item.requestsCount ?? (item.pendingRequestsCount || 0);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-slate-200)',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all var(--transition-fast)'
      }}
      className="my-item-management-card"
    >
      {/* Top Row: Identity & Status */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Thumbnail Photo */}
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: '#f1f5f9',
            flexShrink: 0,
            position: 'relative'
          }}
        >
          <img
            src={primaryImage}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          {item.images && item.images.length > 1 && (
            <span
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {item.images.length}
            </span>
          )}
        </div>

        {/* Info Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category & Sharing Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              {category}
            </span>
            {subcategory && (
              <>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-slate-300)' }}>&bull;</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                  {subcategory}
                </span>
              </>
            )}

            {/* Sharing Type Chip */}
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: sharingMeta.color,
                backgroundColor: sharingMeta.bg,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <SharingIcon size={11} />
              <span>{sharingMeta.label}</span>
            </span>
          </div>

          {/* Item Title */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--color-slate-900)',
              margin: '0 0 6px 0',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            <Link to={`/items/${itemId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {title}
            </Link>
          </h3>

          {/* Condition and Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Badge variant={conditionMeta.variant}>{conditionMeta.label}</Badge>

            {/* Availability / Status indicator */}
            {isAvailable ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Available</span>
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--color-slate-500)',
                  backgroundColor: 'var(--color-slate-100)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-slate-400)' }} />
                <span>Unavailable</span>
              </span>
            )}

            {/* Request Count Pill if present */}
            {requestsCount > 0 && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#b45309',
                  backgroundColor: '#fffbeb',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Inbox size={12} />
                <span>{requestsCount} {requestsCount === 1 ? 'request' : 'requests'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Metadata & Management Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-slate-100)',
          paddingTop: '10px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        {/* Date Listed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
          <Calendar size={13} />
          <span>Shared on {createdDate}</span>
        </div>

        {/* Action Buttons Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Primary View Action */}
          <Button
            size="sm"
            variant="outline"
            iconLeft={Eye}
            onClick={() => navigate(`/items/${itemId}`)}
          >
            View
          </Button>

          {/* Edit Action (Navigates to prepared edit route) */}
          <Button
            size="sm"
            variant="secondary"
            iconLeft={Edit3}
            onClick={() => navigate(`/my-items/${itemId}/edit`)}
          >
            Edit
          </Button>

          {/* Availability Toggle */}
          <button
            type="button"
            disabled={isToggling}
            onClick={() => onToggleAvailability(itemId, isAvailable ? 'Unavailable' : 'Available')}
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-300)',
              backgroundColor: '#ffffff',
              color: isAvailable ? 'var(--color-slate-700)' : '#059669',
              cursor: isToggling ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all var(--transition-fast)'
            }}
            className="toggle-avail-btn"
            title={isAvailable ? 'Temporarily hide listing from discovery' : 'Reactivate listing for discovery'}
          >
            {isAvailable ? <ToggleRight size={16} color="#059669" /> : <ToggleLeft size={16} color="var(--color-slate-400)" />}
            <span>{isAvailable ? 'Mark Unavailable' : 'Make Available'}</span>
          </button>

          {/* Remove Listing Action */}
          <button
            type="button"
            onClick={() => onRequestDelete(item)}
            aria-label={`Remove ${title}`}
            title="Remove listing"
            style={{
              padding: '6px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fee2e2',
              backgroundColor: '#fff5f5',
              color: '#dc2626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition-fast)'
            }}
            className="delete-item-btn"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <style>{`
        .my-item-management-card:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
        }
        .toggle-avail-btn:hover {
          background-color: var(--color-slate-50) !important;
          border-color: var(--color-slate-400) !important;
        }
        .delete-item-btn:hover {
          background-color: #fee2e2 !important;
        }
      `}</style>
    </div>
  );
};

export default MyItemManagementCard;
