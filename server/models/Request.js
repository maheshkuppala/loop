const mongoose = require('mongoose');

/**
 * LOOOP Request & Offer Schema
 * Represents requests to receive/borrow/exchange an item,
 * or offers submitted to help with a WantedItem request.
 */
const requestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    wantedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WantedItem',
      default: null
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have an authenticated requester']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have an owner or recipient']
    },
    type: {
      type: String,
      required: [true, 'Please specify request type'],
      enum: {
        values: ['REQUEST_ITEM', 'BORROW', 'EXCHANGE', 'OFFER'],
        message: 'Invalid request type'
      },
      default: 'REQUEST_ITEM'
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      default: ''
    },
    expectedReturnDate: {
      type: Date,
      default: null
    },
    offeredItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED'],
        message: 'Invalid status'
      },
      default: 'PENDING'
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    declinedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast retrieval by requester, owner, and active statuses
requestSchema.index({ requester: 1, createdAt: -1 });
requestSchema.index({ owner: 1, status: 1, createdAt: -1 });
requestSchema.index({ item: 1, requester: 1, status: 1 });
requestSchema.index({ wantedItem: 1, requester: 1, status: 1 });
requestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
