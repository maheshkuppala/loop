const mongoose = require('mongoose');

/**
 * LOOOP Community Match Schema
 * Tracks real, calculated algorithmic matches between active Item listings
 * and WantedItem requests in the local community.
 * Fully deterministic, privacy-preserving, and deduplicated.
 */
const matchSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Match must reference an active Item'],
      index: true
    },
    wantedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WantedItem',
      required: [true, 'Match must reference an active WantedItem'],
      index: true
    },
    itemOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Match must reference the Item owner'],
      index: true
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Match must reference the WantedItem requester'],
      index: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    matchReasons: {
      type: [String],
      default: []
    },
    distanceKm: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISMISSED', 'EXPIRED', 'CONVERTED'],
      default: 'ACTIVE',
      index: true
    },
    notified: {
      type: Boolean,
      default: false,
      index: true
    },
    lastEvaluatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring no duplicate match record for the same item + wantedItem pair
matchSchema.index({ item: 1, wantedItem: 1 }, { unique: true });
matchSchema.index({ requester: 1, status: 1, score: -1 });
matchSchema.index({ itemOwner: 1, status: 1, score: -1 });

module.exports = mongoose.model('Match', matchSchema);
