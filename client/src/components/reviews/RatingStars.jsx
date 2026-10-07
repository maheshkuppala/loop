import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Accessible Star Rating Component
 * Supports both display mode and interactive input mode (1-5 stars).
 */
export const RatingStars = ({
  rating = 0,
  maxStars = 5,
  size = 18,
  interactive = false,
  onChange = () => {},
  disabled = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || rating || 0;

  return (
    <div
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Rating selection' : `Rated ${rating} out of ${maxStars} stars`}
      className={`rating-stars-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        userSelect: 'none'
      }}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = activeRating >= starValue;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              disabled={disabled}
              onClick={() => !disabled && onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              onFocus={() => !disabled && setHoverRating(starValue)}
              onBlur={() => !disabled && setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '3px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFilled ? '#f59e0b' : '#cbd5e1',
                transition: 'transform 0.15s ease, color 0.15s ease',
                outline: 'none',
                borderRadius: '4px'
              }}
              className="star-rating-btn"
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                strokeWidth={isFilled ? 0 : 2}
                color={isFilled ? '#f59e0b' : '#94a3b8'}
              />
            </button>
          );
        }

        return (
          <span
            key={starValue}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: isFilled ? '#f59e0b' : '#cbd5e1'
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : '#f1f5f9'}
              strokeWidth={isFilled ? 0 : 1.5}
              color={isFilled ? '#f59e0b' : '#cbd5e1'}
            />
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars;
