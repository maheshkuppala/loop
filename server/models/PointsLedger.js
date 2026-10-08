const mongoose = require('mongoose');

/**
 * LOOOP Points Ledger Schema
 * Tracks every points credit, debit, or adjustment for auditability.
 */
const pointsLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Points ledger entry must be linked to a user'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Points amount is required']
    },
    type: {
      type: String,
      enum: {
        values: [
          'REUSE_EARNED',
          'BORROW_EARNED',
          'RETURN_EARNED',
          'REDEEMED',
          'ADMIN_ADJUSTMENT',
          'BONUS'
        ],
        message: 'Invalid points entry type'
      },
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Reason for points transaction is required'],
      trim: true
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
      index: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    balanceAfter: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

pointsLedgerSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PointsLedger', pointsLedgerSchema);
