import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Badge from './Badge';
import Rating from './Rating';
import Avatar from './Avatar';
import LocationBadge from './LocationBadge';
import { formatSharingType, formatCondition } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import AuthPromptModal from './AuthPromptModal';

export const ItemCard = ({ item, onSaveToggle, isSaved: propIsSaved, isSaving = false }) => {
  const itemId = item?.id || item?._id;
  const [isSaved, setIsSaved] = useState(propIsSaved ?? item?.isSaved ?? item?.saved ?? false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { addToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (propIsSaved !== undefined) {
      setIsSaved(propIsSaved);
    } else if (item?.isSaved !== undefined) {
      setIsSaved(Boolean(item.isSaved));
    }
  }, [propIsSaved, item?.isSaved]);

  if (!item) return null;

  const sharingInfo = formatSharingType(item.sharingType);
  const conditionInfo = formatCondition(item.condition);
  const primaryImage =
    item.images && item.images.length > 0
      ? typeof item.images[0] === 'string'
        ? item.images[0]
        : item.images[0]?.url || null
      : null;
  const isItemUnavailable = item.isUnavailable || item.availability === 'Unavailable' || item.status === 'removed' || item.status === 'RESERVED';

  // Action Button Text derived strictly from sharingType
  const getActionButtonLabel = () => {
    if (isItemUnavailable) return item.status === 'RESERVED' ? 'RESERVED' : 'UNAVAILABLE';
    const type = (item.sharingType || '').toLowerCase();
    if (type === 'give_away' || type === 'free') return 'REQUEST TO REUSE';
    if (type === 'borrow') return 'BORROW THIS ITEM';
    if (type === 'exchange') return 'REQUEST EXCHANGE';
    if (type === 'low_cost') return 'REQUEST ITEM';
    return 'REQUEST ITEM';
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;

    if (!isAuthenticated && !user) {
      setShowAuthModal(true);
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (onSaveToggle) {
      onSaveToggle(itemId, nextSaved);
    } else {
      addToast({
        title: nextSaved ? 'Item Saved' : 'Removed from Saved',
        message: nextSaved ? `"${item.title}" added to your saved list.` : `"${item.title}" removed from saved items.`,
        variant: nextSaved ? 'success' : 'info'
      });
    }
  };

  const isOwnerVerified = item.owner?.verified || (item.owner?.trustScore && item.owner.trustScore >= 80);

  return (
    <div
      className="item-card item-card-3d card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--color-slate-200)',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isItemUnavailable ? 0.9 : 1
      }}
    >
      <Link
        to={`/items/${itemId}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit'
        }}
      >
        {/* Card Media Header with Subtle Hover Zoom */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '210px',
            backgroundColor: 'var(--color-slate-100)',
            overflow: 'hidden'
          }}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={item.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isItemUnavailable ? 'grayscale(35%)' : 'none',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="item-card-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-slate-400)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              No Photo Provided
            </div>
          )}

          {/* Top-Left Sharing Type Badge */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, display: 'flex', gap: '6px' }}>
            <Badge variant={sharingInfo.badgeVariant}>
              {sharingInfo.label}
            </Badge>
            {isItemUnavailable && (
              <Badge variant="warning">
                {item.status === 'RESERVED' ? 'Reserved' : 'Unavailable'}
              </Badge>
            )}
          </div>

          {/* Top-Right Save / Wishlist Button */}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            aria-label={isSaved ? 'Remove from saved items' : 'Save item'}
            title={isSaved ? 'Remove from saved items' : 'Save item'}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 2,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(4px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              transition: 'all var(--transition-fast)'
            }}
            className="save-btn"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" color="var(--color-primary-600)" />
            ) : (
              <Heart
                size={18}
                color={isSaved ? '#ef4444' : 'var(--color-slate-600)'}
                fill={isSaved ? '#ef4444' : 'none'}
              />
            )}
          </button>

          {/* Bottom-Left Condition Chip */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              zIndex: 2,
              backgroundColor: 'rgba(15, 23, 42, 0.78)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.725rem',
              fontWeight: 700,
              letterSpacing: '0.02em'
            }}
          >
            {conditionInfo.label}
          </div>
        </div>

        {/* Card Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
          {/* Title */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--color-slate-900)',
              lineHeight: 1.35,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.title}
          </h3>

          {/* Location Badge */}
          <div>
            <LocationBadge location={item.location} distanceKm={item.distanceKm} />
          </div>

          {/* Owner Info with Verified Badge */}
          <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--color-slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar
                src={item.owner?.avatar}
                name={item.owner?.name}
                size="sm"
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-800)', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {item.owner?.name || 'Community Member'}
                  {isOwnerVerified && (
                    <CheckCircle2 size={13} color="#059669" title="Verified Community Member" />
                  )}
                </span>
                {item.owner?.trustScore && (
                  <span style={{ fontSize: '0.72rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                    <ShieldCheck size={11} />
                    <span>{item.owner.trustScore}% Trust</span>
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {item.owner?.rating && (
              <Rating score={item.owner.rating} count={item.owner.reviewsCount} size={13} />
            )}
          </div>

          {/* Main Action Button Matching Sharing Type */}
          <div style={{ paddingTop: '8px' }}>
            <div
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isItemUnavailable ? '#f1f5f9' : '#059669',
                color: isItemUnavailable ? '#64748b' : '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '0.04em',
                boxShadow: isItemUnavailable ? 'none' : '0 2px 6px rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)'
              }}
              className="card-action-btn"
            >
              <span>{getActionButtonLabel()}</span>
              {!isItemUnavailable && <ArrowRight size={14} />}
            </div>
          </div>
        </div>
      </Link>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In or Create Account"
        actionTitle="Account Required to Save Items"
        actionDescription={`To save "${item.title || 'this item'}" to your collection, please sign in or create a free account.`}
        redirectPath={window.location.pathname + window.location.search}
      />

      <style>{`
        .item-card-3d:hover {
          transform: translateY(-6px) rotateX(1.5deg) rotateY(-1deg);
          box-shadow: 0 16px 32px -6px rgba(16, 185, 129, 0.22), 0 4px 12px rgba(15, 23, 42, 0.08) !important;
          border-color: #10b981 !important;
        }
        .item-card-3d:hover .item-card-image {
          transform: scale(1.04) !important;
        }
        .item-card-3d:hover .card-action-btn {
          background-color: #047857 !important;
        }
      `}</style>
    </div>
  );
};

export default ItemCard;
