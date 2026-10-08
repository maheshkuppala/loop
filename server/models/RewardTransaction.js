const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardWallet',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['EARNED', 'REDEEMED', 'ADJUSTED', 'REFUNDED', 'REVERSED', 'EXPIRED'],
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 0
    },
    pointsDelta: {
      type: Number,
      required: true // positive = credit, negative = debit
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
      default: 'COMPLETED'
    },
    sourceType: {
      type: String,
      default: ''
      // TRANSACTION_COMPLETION, EXCHANGE_REDEMPTION, ADMIN_ADJUSTMENT, REFUND, REVERSAL
    },
    sourceId: {
      type: String,
      default: null
    },
    // Idempotency key: unique per (userId + sourceTransactionId) for EARNED type
    sourceTransactionId: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      default: ''
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rewardExchangeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardExchangeOrder',
      default: null
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    itemTitle: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// CRITICAL: Prevent duplicate rewards for same transaction
rewardTransactionSchema.index(
  { userId: 1, sourceTransactionId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { type: 'EARNED', sourceTransactionId: { $ne: null } } }
);

rewardTransactionSchema.index({ userId: 1, createdAt: -1 });
rewardTransactionSchema.index({ walletId: 1, createdAt: -1 });
rewardTransactionSchema.index({ type: 1, status: 1 });
rewardTransactionSchema.index({ createdAt: -1 });
rewardTransactionSchema.index({ rewardExchangeOrderId: 1 });

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
