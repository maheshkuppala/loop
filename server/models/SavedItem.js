const mongoose = require('mongoose');

/**
 * LOOOP SavedItem Schema
 * Dedicated relationship model connecting users to their bookmarked community items.
 * Guarantees scalable indexing, duplicate prevention, and clean pagination.
 */
const savedItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Saved relationship must reference a user'],
      index: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Saved relationship must reference an item'],
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate saves by the same user
savedItemSchema.index({ user: 1, item: 1 }, { unique: true });

// Compound index for fast chronological sorting of a user's saved items
savedItemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedItem', savedItemSchema);
