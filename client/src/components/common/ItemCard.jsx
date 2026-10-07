import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, Loader2 } from 'lucide-react';
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
  const isItemUnavailable = item.isUnavailable || item.availability === 'Unavailable' || item.status === 'removed';

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

  return (
    <div
      className="item-card card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        backgroundColor: '#ffffff',
        opacity: isItemUnavailable ? 0.88 : 1
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
        {/* Card Media Header */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '200px',
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
                filter: isItemUnavailable ? 'grayscale(40%)' : 'none',
                transition: 'transform var(--transition-normal)'
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
                fontSize: '0.9rem'
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
                Unavailable
              </Badge>
            )}
          </div>

          {/* Top-Right Save Item Button */}
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
              boxShadow: 'var(--shadow-md)',
              transition: 'transform var(--transition-fast)'
            }}
            className="save-btn"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" color="var(--color-primary-600)" />
            ) : (
              <Heart
                size={18}
                color={isSaved ? 'var(--color-danger)' : 'var(--color-slate-600)'}
                fill={isSaved ? 'var(--color-danger)' : 'none'}
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
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.725rem',
              fontWeight: 600
            }}
          >
            {conditionInfo.label}
          </div>
        </div>

        {/* Card Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-slate-900)',
              lineHeight: 1.35,
              marginBottom: '6px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.title}
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <LocationBadge location={item.location} distanceKm={item.distanceKm} />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Owner info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar
                src={item.owner?.avatar}
                name={item.owner?.name}
                size="sm"
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-800)', lineHeight: 1.2 }}>
                  {item.owner?.name}
                </span>
                {item.owner?.trustScore && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
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
    </div>
  );
};

export default ItemCard;
