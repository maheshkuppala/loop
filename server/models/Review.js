const mongoose = require('mongoose');

/**
 * LOOOP Review Schema
 * Manages authentic, database-backed community ratings and reviews
 * linked exclusively to verified completed transactions.
 */
const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must reference the reviewer'],
      index: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must reference the user being reviewed'],
      index: true
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: [true, 'Review must reference a completed transaction'],
      index: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Review must reference the related shared item']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5'
      }
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Database-level compound unique constraint: prevent duplicate reviews
// for the same transaction by the same reviewer for the same reviewee
reviewSchema.index({ reviewer: 1, transaction: 1, reviewee: 1 }, { unique: true });

// Performance indexes for fetching reviews by user and date
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
