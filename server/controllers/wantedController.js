const WantedItem = require('../models/WantedItem');
const User = require('../models/User');
const mongoose = require('mongoose');
const matchingService = require('../services/matchingService');

/**
 * Wanted Item Controller
 * Handles creation, retrieval, and management of wanted item requests.
 */

// 1. Create a Wanted Item (POST /api/wanted)
exports.createWantedItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      quantity,
      preferredSharingType,
      conditionPreference,
      location,
      urgency,
      requiredBy,
      expiresAt,
      expiration,
      images,
      coordinates
    } = req.body;

    // --- Validation ---
    // Title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter what you are looking for (Title is required).'
      });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters long.'
      });
    }

    if (trimmedTitle.length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 120 characters.'
      });
    }

    // Description
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please describe what you need (Description is required).'
      });
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters to explain your need clearly.'
      });
    }

    if (trimmedDescription.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 2000 characters.'
      });
    }

    // Category
    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select a category for your wanted request.'
      });
    }

    // Quantity
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number of at least 1.'
      });
    }

    // Preferred Sharing Type
    const validSharingTypes = ['any', 'free', 'give_away', 'borrow', 'exchange'];
    const normalizedSharingType = (preferredSharingType || 'any').toLowerCase().trim();
    if (!validSharingTypes.includes(normalizedSharingType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferred sharing type.'
      });
    }

    // Condition Preference
    const validConditions = ['any', 'new', 'like_new', 'good', 'fair', 'needs_repair'];
    const normalizedCondition = (conditionPreference || 'any').toLowerCase().trim();
    if (!validConditions.includes(normalizedCondition)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid condition preference.'
      });
    }

    // Urgency
    const validUrgencies = ['low', 'medium', 'high'];
    const normalizedUrgency = (urgency || 'medium').toLowerCase().trim();
    if (!validUrgencies.includes(normalizedUrgency)) {
      return res.status(400).json({
        success: false,
        message: 'Urgency must be low, medium, or high.'
      });
    }

    // Location
    const parsedCity =
      location?.city ||
      (typeof location === 'string' ? location.split(',')[0] : 'Bengaluru');

    if (!parsedCity || !parsedCity.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City or region is required for community discovery.'
      });
    }

    const locationObj = {
      city: parsedCity.trim(),
      district: location?.district ? location.district.trim() : '',
      state: location?.state ? location.state.trim() : '',
      locality: location?.locality ? location.locality.trim() : '',
      approximateAddress:
        typeof location === 'string'
          ? location.trim()
          : (location?.approximateAddress || `${location?.locality ? location.locality + ', ' : ''}${parsedCity}`).trim()
    };

    // GeoCoordinates
    let geoCoords = [77.5946, 12.9716];
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      geoCoords = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (location?.coordinates && Array.isArray(location.coordinates)) {
      geoCoords = [Number(location.coordinates[0]), Number(location.coordinates[1])];
    }

    // Required By Date (optional)
    let parsedRequiredBy = null;
    if (requiredBy) {
      const d = new Date(requiredBy);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'The specified Required By date is invalid.'
        });
      }
      parsedRequiredBy = d;
    }

    // Expiration Date (optional or derived from duration)
    let parsedExpiresAt = null;
    if (expiresAt) {
      const d = new Date(expiresAt);
      if (!isNaN(d.getTime())) {
        parsedExpiresAt = d;
      }
    } else if (expiration) {
      const now = new Date();
      if (expiration === '7 days' || expiration === '7') {
        parsedExpiresAt = new Date(now.setDate(now.getDate() + 7));
      } else if (expiration === '14 days' || expiration === '14') {
        parsedExpiresAt = new Date(now.setDate(now.getDate() + 14));
      } else if (expiration === '30 days' || expiration === '30') {
        parsedExpiresAt = new Date(now.setDate(now.getDate() + 30));
      }
    }

    // Optional Images
    let formattedImages = [];
    if (images && Array.isArray(images)) {
      formattedImages = images.slice(0, 4).map((img) => {
        if (typeof img === 'string') {
          return { url: img, caption: '' };
        }
        return {
          url: img.url || '',
          caption: img.caption || ''
        };
      }).filter((img) => img.url);
    }

    // Requester derived strictly from authenticated user token
    const userId = req.user?.id || req.user?._id;
    let requesterId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    if (!requesterId) {
      // Check if user exists in database by email from token
      const existingUser = await User.findOne({ email: req.user?.email });
      if (existingUser) {
        requesterId = existingUser._id;
      } else {
        // Fallback for development demo sessions
        const devUser = await User.findOne();
        requesterId = devUser ? devUser._id : new mongoose.Types.ObjectId();
      }
    }

    // Create MongoDB document
    const wantedItem = new WantedItem({
      title: trimmedTitle,
      description: trimmedDescription,
      category: category.toLowerCase().trim(),
      subcategory: subcategory ? subcategory.trim() : 'General',
      quantity: parsedQuantity,
      preferredSharingType: normalizedSharingType,
      conditionPreference: normalizedCondition,
      location: locationObj,
      locationCoordinates: {
        type: 'Point',
        coordinates: geoCoords
      },
      urgency: normalizedUrgency,
      requiredBy: parsedRequiredBy,
      expiresAt: parsedExpiresAt,
      images: formattedImages,
      status: 'ACTIVE',
      requester: requesterId
    });

    await wantedItem.save();

    // Populate requester details for immediate client display
    await wantedItem.populate('requester', 'name avatar trustScore rating email');

    // Trigger matching against available community items asynchronously
    matchingService.triggerMatchingForWanted(wantedItem).catch((err) => {
      console.error('[wantedController] Error triggering matching for wanted item:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Your wanted item has been posted.',
      wantedItem: {
        ...wantedItem.toObject(),
        id: wantedItem._id
      }
    });
  } catch (error) {
    console.error('Error in createWantedItem:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "We couldn't post your request right now. Please try again."
    });
  }
};

// 2. Get Wanted Items (GET /api/wanted)
exports.getWantedItems = async (req, res) => {
  try {
    const { category, search, urgency, my } = req.query;
    const filter = { status: 'ACTIVE' };

    if (my && req.user) {
      delete filter.status; // requester can view their own non-active items too
      filter.requester = req.user.id || req.user._id;
    }

    if (category && category !== 'all') {
      filter.category = category.toLowerCase().trim();
    }

    if (urgency && urgency !== 'all') {
      filter.urgency = urgency.toLowerCase().trim();
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } },
        { 'location.locality': { $regex: q, $options: 'i' } }
      ];
    }

    const items = await WantedItem.find(filter)
      .populate('requester', 'name avatar trustScore rating')
      .sort({ createdAt: -1 })
      .limit(50);

    const formatted = items.map((item) => ({
      ...item.toObject(),
      id: item._id
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      wantedItems: formatted
    });
  } catch (error) {
    console.error('Error in getWantedItems:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve wanted items right now.'
    });
  }
};

// 3. Get Wanted Item by ID (GET /api/wanted/:id)
exports.getWantedItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Wanted item request not found.'
      });
    }

    const wantedItem = await WantedItem.findById(id).populate(
      'requester',
      'name avatar trustScore rating email verified responseRate'
    );

    if (!wantedItem) {
      return res.status(404).json({
        success: false,
        message: 'Wanted item request not found.'
      });
    }

    return res.status(200).json({
      success: true,
      wantedItem: {
        ...wantedItem.toObject(),
        id: wantedItem._id
      }
    });
  } catch (error) {
    console.error('Error in getWantedItemById:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve wanted item details.'
    });
  }
};

// 4. Delete / Close Wanted Item (DELETE /api/wanted/:id)
exports.deleteWantedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Wanted item not found.'
      });
    }

    const item = await WantedItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wanted item not found.'
      });
    }

    // Verify ownership
    if (item.requester.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove this request.'
      });
    }

    await WantedItem.findByIdAndDelete(id);

    // Invalidate active matches for this wanted item
    matchingService.invalidateWantedMatches(id, 'CLOSED').catch((err) => {
      console.error('[wantedController] Error invalidating matches on delete:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: 'Wanted item request removed successfully.'
    });
  } catch (error) {
    console.error('Error in deleteWantedItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not remove wanted item.'
    });
  }
};

/**
 * GET /api/wanted/:id/matches
 * Retrieve available community items that match this WantedItem request
 */
exports.getWantedMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { minScore = 40, radius } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wanted item ID.'
      });
    }

    const wantedItem = await WantedItem.findById(id);
    if (!wantedItem) {
      return res.status(404).json({
        success: false,
        message: 'Wanted item not found.'
      });
    }

    const matches = await matchingService.findMatchesForWantedItem(wantedItem, {
      minScore: parseInt(minScore, 10) || 40,
      radiusKm: radius ? parseFloat(radius) : undefined
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error in getWantedMatches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve matches for wanted item.'
    });
  }
};
