import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Tag,
  ShieldCheck,
  ExternalLink,
  Eye,
  AlertCircle
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { formatSharingType, formatCondition } from '../../utils/formatters';

export const RequestItemCard = ({
  item,
  title = 'Requested Item',
  isOffered = false,
  badgeText = null
}) => {
  if (!item) {
    return (
      <Card style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px dashed var(--color-slate-300)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-slate-500)', fontSize: '0.9rem' }}>
          <AlertCircle size={20} color="var(--color-slate-400)" />
          <span>This item is no longer available in the sharing circle.</span>
        </div>
      </Card>
    );
  }

  const itemId = item.id || item._id;
  const itemTitle = item.title || item.name || 'Shared Item';
  const category = item.category || 'General';
  const condition = item.condition ? formatCondition(item.condition).label : 'Good';
  const sharingType = item.sharingType ? formatSharingType(item.sharingType).label : null;
  const isAvailable = item.availability === 'Available' || item.status === 'AVAILABLE' || !item.status;

  const primaryImage = Array.isArray(item.images) && item.images.length > 0
    ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url)
    : null;

  const locationStr = item.location?.locality
    ? `${item.location.locality}, ${item.location.city || ''}`
    : typeof item.location === 'string'
    ? item.location
    : item.location?.city || null;

  return (
    <Card style={{ padding: '1.25rem', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)' }}>
      {/* Title & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
          {title}
        </h3>
        {badgeText ? (
          <Badge variant="info">{badgeText}</Badge>
        ) : !isAvailable ? (
          <Badge variant="neutral">Unavailable</Badge>
        ) : (
          <Badge variant="success">Available</Badge>
        )}
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }} className="request-item-card-inner">
        {/* Item Image */}
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={itemTitle}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-200)',
              flexShrink: 0
            }}
          />
        ) : (
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-slate-100)',
              color: 'var(--color-slate-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Package size={32} />
          </div>
        )}

        {/* Item Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--color-slate-900)',
              margin: '0 0 6px 0',
              lineHeight: 1.3
            }}
          >
            {itemTitle}
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-slate-600)', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>
              {category}
            </span>
            <span>•</span>
            <span style={{ textTransform: 'capitalize' }}>Condition: {condition}</span>
            {sharingType && (
              <>
                <span>•</span>
                <span>{sharingType}</span>
              </>
            )}
          </div>

          {locationStr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-slate-500)', marginBottom: '10px' }}>
              <MapPin size={13} color="var(--color-primary-600)" />
              <span>{locationStr}</span>
            </div>
          )}

          {/* Action to view item listing */}
          {itemId && (
            <Link
              to={`/items/${itemId}`}
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              <Button variant="outline" size="sm" iconRight={ExternalLink}>
                View Item
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RequestItemCard;
