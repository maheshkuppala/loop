import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, Clock, ArrowRight, User } from 'lucide-react';
import Avatar from '../common/Avatar';
import RatingStars from '../reviews/RatingStars';

export const OwnerProfileCard = ({ owner }) => {
  if (!owner) return null;

  const displayName = owner.name || 'Community Sharer';
  const ownerId = owner._id || owner.id;
  const rating = Number(owner.rating || 0);
  const reviewsCount = Number(owner.reviewsCount || 0);
  const isVerified = owner.verified !== false;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-slate-200)',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
      className="owner-profile-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-slate-100)', paddingBottom: '12px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-slate-400)' }}>
          Shared by
        </span>
        {isVerified && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} />
            <span>Verified Member</span>
          </span>
        )}
      </div>

      {/* Owner Avatar & Brief */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {ownerId ? (
          <Link to={`/users/${ownerId}`} style={{ textDecoration: 'none' }}>
            <Avatar src={owner.avatar} name={displayName} size="lg" />
          </Link>
        ) : (
          <Avatar src={owner.avatar} name={displayName} size="lg" />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {ownerId ? (
            <Link
              to={`/users/${ownerId}`}
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--color-slate-900)',
                margin: '0 0 4px 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: 'none',
                display: 'block'
              }}
              className="owner-name-link hover:underline"
            >
              {displayName}
            </Link>
          ) : (
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 4px 0' }}>
              {displayName}
            </h3>
          )}

          {/* Real Reviews / Rating Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {reviewsCount > 0 ? (
              <>
                <RatingStars rating={Math.round(rating)} size={14} />
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                  ★ {rating.toFixed(1)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                  · {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                New member · No reviews yet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trust & Activity Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--color-slate-200)',
          fontSize: '0.8rem'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-slate-700)', fontWeight: 600 }}>
          <ShieldCheck size={15} color="#059669" />
          <span>Peer-confirmed handovers</span>
        </span>
        <span style={{ color: '#047857', fontWeight: 700 }}>
          Community verified
        </span>
      </div>

      {/* Public Profile Link */}
      {ownerId && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
          <Link
            to={`/users/${ownerId}`}
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--color-primary-700)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            className="view-member-profile-link"
          >
            <span>View community profile & reviews</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      <style>{`
        .view-member-profile-link:hover {
          text-decoration: underline;
        }
        .owner-name-link:hover {
          color: var(--color-primary-700);
        }
      `}</style>
    </div>
  );
};

export default OwnerProfileCard;
