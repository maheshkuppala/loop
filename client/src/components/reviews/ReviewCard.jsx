import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Package, Calendar, Edit2, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import RatingStars from './RatingStars';
import { formatDate } from '../../utils/formatters';

/**
 * ReviewCard Component
 * Renders an authentic review tied to a verified handover.
 */
export const ReviewCard = ({
  review,
  currentUserId = null,
  onEdit = null,
  onDelete = null
}) => {
  if (!review) return null;

  const reviewer = review.reviewer || {};
  const reviewerId = reviewer.id || reviewer._id;
  const reviewerName = reviewer.name || 'Community Member';
  const item = review.item;

  const isAuthor = currentUserId && reviewerId && currentUserId.toString() === reviewerId.toString();

  // Format real date
  const displayDate = review.createdAt ? formatDate(review.createdAt) : 'Recently';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-slate-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
      className="review-card"
    >
      {/* Header: Reviewer info + Rating & Date */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {reviewerId ? (
            <Link to={`/users/${reviewerId}`} style={{ textDecoration: 'none' }}>
              <Avatar src={reviewer.avatar} name={reviewerName} size="md" />
            </Link>
          ) : (
            <Avatar src={reviewer.avatar} name={reviewerName} size="md" />
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {reviewerId ? (
                <Link
                  to={`/users/${reviewerId}`}
                  style={{
                    fontSize: '0.925rem',
                    fontWeight: 800,
                    color: 'var(--color-slate-900)',
                    textDecoration: 'none'
                  }}
                  className="reviewer-profile-link"
                >
                  {reviewerName}
                </Link>
              ) : (
                <span style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                  {reviewerName}
                </span>
              )}

              {reviewer.verified && (
                <span
                  title="Verified Community Member"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: '#059669',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  <ShieldCheck size={14} />
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
              <span>{displayDate}</span>
              {reviewer.city && reviewer.state && (
                <>
                  <span>•</span>
                  <span>{reviewer.city}, {reviewer.state}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating Stars & Author Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RatingStars rating={review.rating} size={15} />

          {isAuthor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  title="Edit your review"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--color-slate-400)',
                    borderRadius: '4px'
                  }}
                  className="hover-action-btn"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(review.id || review._id)}
                  title="Delete review"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: '#ef4444',
                    borderRadius: '4px'
                  }}
                  className="hover-action-btn"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Comment */}
      {review.comment ? (
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-slate-700)',
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: 'pre-line'
          }}
        >
          {review.comment}
        </p>
      ) : (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-400)', fontStyle: 'italic', margin: 0 }}>
          Rated {review.rating} stars with no written comment.
        </p>
      )}

      {/* Handover Item Reference Tag */}
      {item && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--color-slate-500)',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--color-slate-100)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            width: 'fit-content'
          }}
        >
          <Package size={13} color="var(--color-primary-600)" />
          <span>Handover for: <strong>{item.title}</strong></span>
        </div>
      )}

      <style>{`
        .reviewer-profile-link:hover {
          color: var(--color-primary-600);
          text-decoration: underline;
        }
        .hover-action-btn:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default ReviewCard;
