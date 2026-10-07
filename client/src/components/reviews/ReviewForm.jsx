import React, { useState } from 'react';
import { Star, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import RatingStars from './RatingStars';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { reviewService } from '../../services/reviewService';

/**
 * ReviewForm Component
 * Interactive form to rate and review a completed transaction.
 */
export const ReviewForm = ({
  transactionId,
  partnerName = 'Neighbor',
  itemTitle = 'Item',
  existingReview = null,
  onSuccess = () => {},
  onCancel = null
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isEditing = !!existingReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = await reviewService.updateReview(existingReview.id || existingReview._id, {
          rating,
          comment: comment.trim()
        });
      } else {
        res = await reviewService.createReview({
          transactionId,
          rating,
          comment: comment.trim()
        });
      }

      if (res && res.success) {
        setSuccessMessage(res.message || 'Review submitted successfully!');
        setTimeout(() => {
          onSuccess(res.review || res);
        }, 800);
      } else {
        throw new Error(res?.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to submit review. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5:
        return 'Exceptional handover! ⭐⭐⭐⭐⭐';
      case 4:
        return 'Very good experience ⭐⭐⭐⭐';
      case 3:
        return 'Average handover ⭐⭐⭐';
      case 2:
        return 'Room for improvement ⭐⭐';
      case 1:
        return 'Difficult handover ⭐';
      default:
        return 'Click a star to rate your handover experience';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
      className="review-form"
    >
      {/* Target Transaction Context */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-100)',
          fontSize: '0.85rem',
          color: 'var(--color-primary-900)'
        }}
      >
        <span>
          Sharing feedback for <strong>{partnerName}</strong> regarding{' '}
          <strong>"{itemTitle}"</strong>.
        </span>
      </div>

      {/* Star Rating Selector */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--color-slate-800)',
            marginBottom: '6px'
          }}
        >
          Overall Experience Rating <span style={{ color: '#ef4444' }}>*</span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RatingStars
            rating={rating}
            interactive
            size={28}
            onChange={(val) => {
              setRating(val);
              if (error) setError(null);
            }}
            disabled={submitting}
          />
          <span
            style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: rating > 0 ? 'var(--color-primary-700)' : 'var(--color-slate-400)'
            }}
          >
            {getRatingLabel(rating)}
          </span>
        </div>
      </div>

      {/* Written Feedback Textarea */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label
            htmlFor="review-comment"
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-slate-800)'
            }}
          >
            Share Your Experience <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-slate-400)' }}>(optional)</span>
          </label>
          <span style={{ fontSize: '0.75rem', color: comment.length > 900 ? '#ef4444' : 'var(--color-slate-400)' }}>
            {comment.length} / 1000
          </span>
        </div>

        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          maxLength={1000}
          disabled={submitting}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`How was the item condition, communication, punctuality, and handover with ${partnerName}?`}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-slate-300)',
            fontSize: '0.9rem',
            color: 'var(--color-slate-800)',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.85rem'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontSize: '0.85rem'
          }}
        >
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={submitting || rating === 0}
          style={{ minWidth: '150px' }}
        >
          {submitting ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Spinner size="sm" />
              <span>Submitting...</span>
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={15} />
              <span>{isEditing ? 'Update Review' : 'Submit Review'}</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
