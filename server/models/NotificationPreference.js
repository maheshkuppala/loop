const mongoose = require('mongoose');

/**
 * LOOOP Notification Preference Schema
 * Manages per-user notification delivery settings, category toggles,
 * quiet hours, and channel permissions.
 */
const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification preferences must belong to a user'],
      unique: true,
      index: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    browser: {
      type: Boolean,
      default: false
    },
    categories: {
      requests: {
        type: Boolean,
        default: true
      },
      transactions: {
        type: Boolean,
        default: true
      },
      messages: {
        type: Boolean,
        default: true
      },
      matching: {
        type: Boolean,
        default: true
      },
      items: {
        type: Boolean,
        default: true
      },
      safety: {
        type: Boolean,
        default: true
      },
      account: {
        type: Boolean,
        default: true // Immutable: Essential account & security alerts cannot be disabled
      },
      impact: {
        type: Boolean,
        default: true
      },
      system: {
        type: Boolean,
        default: true
      }
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String,
        default: '22:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Quiet hours start must be in HH:mm format']
      },
      end: {
        type: String,
        default: '07:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Quiet hours end must be in HH:mm format']
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      }
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: ensure account security notifications cannot be disabled
notificationPreferenceSchema.pre('save', function (next) {
  if (this.categories) {
    this.categories.account = true;
  }
  next();
});

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
