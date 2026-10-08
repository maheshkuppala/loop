const mongoose = require('mongoose');

/**
 * LOOOP Community Item Schema
 * Represents unused goods shared within the local community.
 * Follows circular economy principles: Free, Give Away, Borrow, Exchange.
 */
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter an item title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide an item description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
      enum: [
        'books',
        'electronics',
        'education',
        'furniture',
        'clothing',
        'sports',
        'tools',
        'home',
        'accessories',
        'mobility',
        'other'
      ]
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: [60, 'Subcategory cannot exceed 60 characters'],
      default: 'General'
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [60, 'Brand name cannot exceed 60 characters'],
      default: ''
    },
    model: {
      type: String,
      trim: true,
      maxlength: [60, 'Model cannot exceed 60 characters'],
      default: ''
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          isPrimary: { type: Boolean, default: false },
          caption: { type: String, default: '' }
        }
      ],
      validate: [
        {
          validator: function (val) {
            return Array.isArray(val) && val.length > 0;
          },
          message: 'Please add at least one photo of the item'
        },
        {
          validator: function (val) {
            return Array.isArray(val) && val.length <= 20;
          },
          message: 'Photos limit exceeded'
        }
      ]
    },
    sharingType: {
      type: String,
      required: [true, 'Please choose a sharing type'],
      enum: ['free', 'give_away', 'borrow', 'exchange'],
      default: 'give_away'
    },
    condition: {
      type: String,
      required: [true, 'Please specify the item condition'],
      enum: ['new', 'like_new', 'good', 'fair', 'needs_repair'],
      default: 'good'
    },
    availability: {
      type: String,
      enum: ['Available', 'Unavailable', 'Reserved'],
      default: 'Available'
    },
    status: {
      type: String,
      enum: ['active', 'pending moderation', 'rejected', 'removed', 'suspended'],
      default: 'active'
    },
    approvalStatus: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'APPROVED'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    specifications: [
      {
        key: { type: String, trim: true, default: '' },
        value: { type: String, trim: true, default: '' }
      }
    ],
    location: {
      city: {
        type: String,
        required: [true, 'Please specify a city/region'],
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
        default: [77.5946, 12.9716] // Default Bengaluru center approximate
      }
    },
    borrowSettings: {
      maxDurationDays: {
        type: Number,
        min: [1, 'Borrowing duration must be at least 1 day'],
        max: [365, 'Borrowing duration cannot exceed 365 days'],
        default: 14
      },
      maxDurationUnit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'days'
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Borrowing notes cannot exceed 500 characters'],
        default: ''
      }
    },
    exchangeDetails: {
      wantedItems: {
        type: String,
        trim: true,
        maxlength: [300, 'Exchange wishlist cannot exceed 300 characters'],
        default: ''
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must have an owner derived from authentication']
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    savesCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high-frequency circular economy discovery queries
itemSchema.index({ category: 1, status: 1, availability: 1 });
itemSchema.index({ category: 1, subcategory: 1, status: 1 });
itemSchema.index({ sharingType: 1, status: 1 });
itemSchema.index({ condition: 1 });
itemSchema.index({ owner: 1, createdAt: -1 });
itemSchema.index({ status: 1, createdAt: -1 });
itemSchema.index({ 'location.city': 1, status: 1 });
itemSchema.index({ locationCoordinates: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Item', itemSchema);
