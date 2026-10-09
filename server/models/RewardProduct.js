const mongoose = require('mongoose');

const rewardProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true
    },
    fullDescription: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'General'
    },
    brand: {
      type: String,
      default: '',
      trim: true
    },
    condition: {
      type: String,
      enum: ['brand_new', 'like_new', 'good', 'refurbished'],
      default: 'brand_new'
    },
    images: {
      type: [
        {
          url: { type: String, default: '' },
          isPrimary: { type: Boolean, default: false },
          caption: { type: String, default: '' }
        }
      ],
      default: []
    },
    sku: {
      type: String,
      default: '',
      trim: true
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 1
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    exchangeAvailable: {
      type: Boolean,
      default: true
    },
    exchangeStartDate: {
      type: Date,
      default: null
    },
    exchangeEndDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'INACTIVE', 'ARCHIVED'],
      default: 'DRAFT'
    },
    totalExchanges: {
      type: Number,
      default: 0
    },
    weight: {
      type: String,
      default: ''
    },
    dimensions: {
      type: String,
      default: ''
    },
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Virtual: available quantity
rewardProductSchema.virtual('availableQuantity').get(function () {
  return Math.max(0, this.stockQuantity - this.reservedQuantity);
});

rewardProductSchema.set('toJSON', { virtuals: true });
rewardProductSchema.set('toObject', { virtuals: true });

rewardProductSchema.index({ status: 1 });
rewardProductSchema.index({ pointsRequired: 1 });
rewardProductSchema.index({ totalExchanges: -1 });
rewardProductSchema.index({ category: 1, status: 1 });
rewardProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RewardProduct', rewardProductSchema);
