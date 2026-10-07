import React from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import ReviewCard from './ReviewCard';
import Skeleton from '../common/Skeleton';
import Button from '../common/Button';

/**
 * ReviewList Component
 * Renders verified community reviews with pagination and empty states.
 */
export const ReviewList = ({
  reviews = [],
  loading = false,
  currentUserId = null,
  page = 1,
  totalPages = 1,
  onLoadMore = null,
  loadingMore = false,
  onEditReview = null,
  onDeleteReview = null,
  emptyTitle = 'No reviews yet',
  emptyDescription = 'Complete a transaction to start building your community reputation.'
}) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-slate-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Skeleton width="40px" height="40px" circle />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <Skeleton width="120px" height="16px" />
                <Skeleton width="80px" height="12px" />
              </div>
              <Skeleton width="90px" height="16px" />
            </div>
            <Skeleton width="100%" height="14px" />
            <Skeleton width="75%" height="14px" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div
        style={{
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#ffffff',
          border: '1px dashed var(--color-slate-200)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
        className="empty-reviews-state"
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-50)',
            color: 'var(--color-primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MessageSquare size={24} />
        </div>
        <strong style={{ fontSize: '1.1rem', color: 'var(--color-slate-800)' }}>
          {emptyTitle}
        </strong>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', margin: 0, maxWidth: '380px' }}>
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="reviews-list-container">
      {reviews.map((rev) => (
        <ReviewCard
          key={rev.id || rev._id}
          review={rev}
          currentUserId={currentUserId}
          onEdit={onEditReview}
          onDelete={onDeleteReview}
        />
      ))}

      {onLoadMore && page < totalPages && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
          <Button
            type="button"
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{ minWidth: '160px' }}
          >
            {loadingMore ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} className="spin-icon" />
                <span>Loading more...</span>
              </span>
            ) : (
              <span>Load More Reviews</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
