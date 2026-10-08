const mongoose = require('mongoose');

/**
 * LOOOP Transaction Schema
 * Manages item handover, borrowing, return, and completion lifecycles
 * for accepted requests.
 */
const transactionSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: [true, 'Transaction must be linked to an accepted request'],
      unique: true
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Transaction must reference the primary item']
    },
    offeredItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must reference the item owner']
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must reference the recipient']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['FREE', 'GIVEAWAY', 'BORROW', 'EXCHANGE'],
        message: 'Invalid transaction type'
      }
    },
    status: {
      type: String,
      enum: {
        values: [
          'PENDING_HANDOVER',
          'HANDOVER_SCHEDULED',
          'HANDED_OVER',
          'ACTIVE',
          'RETURN_PENDING',
          'RETURNED',
          'COMPLETED',
          'CANCELLED'
        ],
        message: 'Invalid transaction status'
      },
      default: 'PENDING_HANDOVER'
    },
    handoverMethod: {
      type: String,
      enum: ['In Person', 'Pickup', 'Other'],
      default: 'In Person'
    },
    handoverDate: {
      type: Date,
      default: null
    },
    handoverTime: {
      type: String,
      trim: true,
      default: ''
    },
    handoverLocation: {
      city: { type: String, trim: true, default: '' },
      locality: { type: String, trim: true, default: '' },
      meetingArea: { type: String, trim: true, default: '' },
      notes: { type: String, trim: true, default: '' }
    },
    handoverNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Handover notes cannot exceed 1000 characters'],
      default: ''
    },
    handoverConfirmedByOwner: {
      type: Boolean,
      default: false
    },
    handoverConfirmedByRecipient: {
      type: Boolean,
      default: false
    },
    handoverConfirmedAt: {
      type: Date,
      default: null
    },
    expectedReturnDate: {
      type: Date,
      default: null
    },
    returnDate: {
      type: Date,
      default: null
    },
    returnNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Return notes cannot exceed 1000 characters'],
      default: ''
    },
    returnConfirmedByBorrower: {
      type: Boolean,
      default: false
    },
    returnConfirmedByOwner: {
      type: Boolean,
      default: false
    },
    returnConfirmedAt: {
      type: Date,
      default: null
    },
    returnedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    pointsAwarded: {
      type: Boolean,
      default: false,
      index: true
    },
    pointsAwardedAmount: {
      type: Number,
      default: 0
    },
    pointsAwardedAt: {
      type: Date,
      default: null
    },
    customerConfirmedAt: {
      type: Date,
      default: null
    },
    ownerConfirmedAt: {
      type: Date,
      default: null
    },
    adminConfirmedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast querying by participant, status, and request
transactionSchema.index({ owner: 1, status: 1, createdAt: -1 });
transactionSchema.index({ recipient: 1, status: 1, createdAt: -1 });
transactionSchema.index({ item: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
