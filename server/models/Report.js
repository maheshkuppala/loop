const mongoose = require('mongoose');

/**
 * LOOOP Report Schema
 * Handles community moderation reports for listings and user profiles.
 */
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Report must reference the reporting user'],
      index: true
    },
    targetType: {
      type: String,
      required: [true, 'Report target type is required'],
      enum: {
        values: ['USER', 'ITEM'],
        message: 'Target type must be USER or ITEM'
      },
      index: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    targetItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null,
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the report'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: ''
    },
    actionTaken: {
      type: String,
      trim: true,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Report', reportSchema);
