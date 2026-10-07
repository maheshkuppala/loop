const mongoose = require('mongoose');

/**
 * LOOOP Conversation Schema
 * Represents a direct messaging channel between two participants
 * who share an accepted request, transaction, or other legitimate platform relationship.
 */
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    lastMessageText: {
      type: String,
      trim: true,
      default: ''
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup, listing, and participant querying
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ request: 1 }, { unique: true });
conversationSchema.index({ transaction: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
