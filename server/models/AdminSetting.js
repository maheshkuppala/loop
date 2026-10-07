const mongoose = require('mongoose');

/**
 * LOOOP Admin Setting Schema
 * Stores controlled platform configurations safely in MongoDB.
 * Never stores secrets, API keys, or private environment variables.
 */
const adminSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'GENERAL'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AdminSetting', adminSettingSchema);
