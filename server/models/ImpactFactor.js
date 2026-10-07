const mongoose = require('mongoose');

/**
 * LOOOP Impact Factor Schema
 * Represents scientifically verified or policy-configured environmental conversion metrics
 * applied deterministically to completed reuse activities.
 *
 * LOOOP does NOT fabricate arbitrary scientific values.
 * Every factor records its category, unit, calculation basis, documented source, and version.
 */
const impactFactorSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Factor category is required'],
      trim: true,
      index: true
    },
    metricType: {
      type: String,
      required: [true, 'Metric type is required'],
      enum: {
        values: ['CO2E_AVOIDED', 'WASTE_AVOIDED', 'WATER_SAVED', 'REUSE_COUNT'],
        message: 'Invalid metric type'
      },
      index: true
    },
    value: {
      type: Number,
      required: [true, 'Factor conversion value is required'],
      min: [0, 'Factor value cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Factor unit is required (e.g. kg CO2e, kg waste, liters)'],
      trim: true
    },
    basis: {
      type: String,
      required: [true, 'Calculation basis is required (e.g. per item reused)'],
      trim: true,
      default: 'per item reused'
    },
    source: {
      type: String,
      required: [true, 'Documented scientific or organizational source is required'],
      trim: true
    },
    methodologyVersion: {
      type: String,
      trim: true,
      default: '1.0'
    },
    factorVersion: {
      type: Number,
      default: 1
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for active factors lookup by category and metric type
impactFactorSchema.index({ category: 1, metricType: 1, active: 1 });
impactFactorSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ImpactFactor', impactFactorSchema);
