const mongoose = require('mongoose');

const rewardWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    availablePoints: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRedeemed: {
      type: Number,
      default: 0,
      min: 0
    },
    isFrozen: {
      type: Boolean,
      default: false
    },
    frozenReason: {
      type: String,
      default: ''
    },
    frozenByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    frozenAt: {
      type: Date,
      default: null
    },
    lastActivityAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

rewardWalletSchema.index({ userId: 1 }, { unique: true });
rewardWalletSchema.index({ availablePoints: -1 });
rewardWalletSchema.index({ lastActivityAt: -1 });

module.exports = mongoose.model('RewardWallet', rewardWalletSchema);
