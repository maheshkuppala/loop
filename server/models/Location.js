const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['CITY', 'DISTRICT', 'STATE', 'LOCALITY', 'TOWN', 'VILLAGE'],
      default: 'CITY'
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    district: {
      type: String,
      default: '',
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

locationSchema.index({ latitude: 1, longitude: 1 });
locationSchema.index({ name: 'text', city: 'text', state: 'text', district: 'text' });

module.exports = mongoose.model('Location', locationSchema);
