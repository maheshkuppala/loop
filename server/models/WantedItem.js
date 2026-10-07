const mongoose = require('mongoose');

/**
 * LOOOP Community Wanted Item Schema
 * Represents requests from community members looking for products they currently need.
 * Allows other neighbors who own unused items to discover and offer help.
 */
const wantedItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter what you are looking for'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please describe what you need'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: [60, 'Subcategory cannot exceed 60 characters'],
      default: 'General'
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [1, 'Quantity must be at least 1'],
      max: [999, 'Quantity cannot exceed 999'],
      default: 1
    },
    preferredSharingType: {
      type: String,
      required: [true, 'Please choose a sharing preference'],
      enum: {
        values: ['any', 'free', 'give_away', 'borrow', 'exchange'],
        message: 'Invalid preferred sharing type'
      },
      default: 'any'
    },
    conditionPreference: {
      type: String,
      required: [true, 'Please choose a condition preference'],
      enum: {
        values: ['any', 'new', 'like_new', 'good', 'fair', 'needs_repair'],
        message: 'Invalid condition preference'
      },
      default: 'any'
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please specify city/region'],
        trim: true
      },
      district: {
        type: String,
        trim: true,
        default: ''
      },
      state: {
        type: String,
        trim: true,
        default: ''
      },
      locality: {
        type: String,
        trim: true,
        default: ''
      },
      approximateAddress: {
        type: String,
        trim: true,
        default: ''
      }
    },
    locationCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716] // Default Bengaluru center
      }
    },
    urgency: {
      type: String,
      required: [true, 'Please specify urgency'],
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Urgency must be low, medium, or high'
      },
      default: 'medium'
    },
    requiredBy: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          caption: { type: String, default: '' }
        }
      ],
      validate: [
        {
          validator: function (val) {
            return !val || val.length <= 4;
          },
          message: 'You can attach up to 4 reference photos'
        }
      ],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'FULFILLED', 'EXPIRED', 'CLOSED'],
        message: 'Status must be ACTIVE, FULFILLED, EXPIRED, or CLOSED'
      },
      default: 'ACTIVE'
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wanted item request must have an authenticated requester']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast location, category and status queries
wantedItemSchema.index({ status: 1, category: 1, createdAt: -1 });
wantedItemSchema.index({ status: 1, createdAt: -1 });
wantedItemSchema.index({ requester: 1, createdAt: -1 });
wantedItemSchema.index({ 'location.city': 1, status: 1 });
wantedItemSchema.index({ locationCoordinates: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('WantedItem', wantedItemSchema);
