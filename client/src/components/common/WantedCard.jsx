import React from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowRight,
  HandHelping,
  Trash2
} from 'lucide-react';
import Badge from './Badge';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';
import LocationBadge from './LocationBadge';
import Button from './Button';

export const WantedCard = ({
  wanted,
  onHelpClick,
  onDeleteClick,
  showActions = true,
  isOwner = false
}) => {
  if (!wanted) return null;

  const id = wanted.id || wanted._id;
  const requester = wanted.requester || wanted.user || { name: 'Community Member' };
  const urgency = (wanted.urgency || 'MODERATE').toUpperCase();

  const urgencyColors = {
    HIGH: { variant: 'danger', label: 'Urgent' },
    URGENT: { variant: 'danger', label: 'Urgent' },
    MODERATE: { variant: 'warning', label: 'Moderate' },
    LOW: { variant: 'neutral', label: 'Flexible' }
  }[urgency] || { variant: 'neutral', label: urgency };

  const formattedRequiredDate = wanted.requiredBy
    ? new Date(wanted.requiredBy).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div
      className="wanted-card card subtle-3d-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-slate-200)',
        backgroundColor: '#ffffff',
        position: 'relative'
      }}
    >
      {/* Top Meta Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="info">
            <HelpCircle size={12} />
            <span>Wanted</span>
          </Badge>
          <Badge variant={urgencyColors.variant}>
            {urgencyColors.label}
          </Badge>
          {wanted.category && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
              • {wanted.category}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge status={wanted.status || 'ACTIVE'} size="sm" />
          {isOwner && onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(id)}
              aria-label="Delete wanted item request"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-slate-400)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-xs)',
                transition: 'color var(--transition-fast)'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--color-slate-900)',
          marginBottom: '0.5rem',
          lineHeight: 1.3
        }}
      >
        <Link
          to={`/wanted/${id}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {wanted.title}
        </Link>
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--color-slate-600)',
          lineHeight: 1.55,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {wanted.description}
      </p>

      {/* Meta Specs: Location, Date & Sharing Preference */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--color-slate-600)'
        }}
      >
        <LocationBadge location={wanted.location} distanceKm={wanted.distanceKm} />

        {formattedRequiredDate && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} color="var(--color-slate-400)" />
            <span>Needed by: {formattedRequiredDate}</span>
          </span>
        )}

        {wanted.preferredSharing && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
            <span>Prefers: <strong>{wanted.preferredSharing.toLowerCase()}</strong></span>
          </span>
        )}
      </div>

      {/* Smart Match Banner */}
      {wanted.matchScore && wanted.matchedItemId && (
        <div
          style={{
            marginBottom: '1rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#059669" />
            <span style={{ fontSize: '0.825rem', color: '#065f46', fontWeight: 600 }}>
              {wanted.matchScore}% Match found nearby: {wanted.matchedItemTitle || 'Available item'}
            </span>
          </div>
          <Link
            to={`/items/${wanted.matchedItemId}`}
            style={{
              fontSize: '0.78rem',
              color: '#047857',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <span>View</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Footer: Requester & Help Action */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-slate-100)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={requester.avatar} name={requester.name} size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-800)' }}>
              {requester.name}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)' }}>
              {wanted.createdAt ? new Date(wanted.createdAt).toLocaleDateString() : 'Community member'}
            </span>
          </div>
        </div>

        {showActions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to={`/wanted/${id}`} style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">
                Details
              </Button>
            </Link>

            {onHelpClick && !isOwner && (
              <Button
                variant="primary"
                size="sm"
                iconLeft={HandHelping}
                onClick={() => onHelpClick(wanted)}
              >
                I Can Help
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WantedCard;
