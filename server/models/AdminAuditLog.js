const mongoose = require('mongoose');

/**
 * LOOOP Admin Audit Log Schema
 * Records all significant administrative actions for accountability and security.
 * Sensitive data (passwords, tokens, secret keys) is strictly prohibited.
 */
const adminAuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Audit log must specify the acting administrator'],
      index: true
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      index: true
    },
    targetType: {
      type: String,
      required: [true, 'Target entity type is required'],
      enum: ['USER', 'ITEM', 'WANTED_ITEM', 'REQUEST', 'TRANSACTION', 'REPORT', 'CATEGORY', 'SETTINGS', 'IMPACT_FACTOR', 'IMPACT_EVENT'],
      index: true
    },
    targetId: {
      type: String,
      default: null,
      index: true
    },
    targetTitle: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying recent actions on a specific target
adminAuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
adminAuditLogSchema.index({ admin: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1, createdAt: -1 });
adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
