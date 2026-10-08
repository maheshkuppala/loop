const Item = require('../models/Item');
const User = require('../models/User');
const mongoose = require('mongoose');
const matchingService = require('../services/matchingService');
const uploadRulesService = require('../services/uploadRulesService');

/**
 * GET /api/items/upload-rules
 */
exports.getUploadRules = async (req, res) => {
  try {
    const rules = await uploadRulesService.getUploadRules();
    return res.status(200).json({ success: true, rules });
  } catch (error) {
    console.error('Error fetching upload rules:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch upload rules.' });
  }
};

/**
 * POST /api/items/upload-media
 */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file was uploaded.' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      file: {
        url: publicUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return res.status(500).json({ success: false, message: 'Failed to process file upload.' });
  }
};

/**
 * Item Controller
 * Handles item creation, listing, retrieval, and sharing workflows
 */
exports.createItem = async (req, res) => {
  try {
    const rules = await uploadRulesService.getUploadRules();
    const userRole = (req.user?.role || '').toLowerCase();
    const isAdmin = userRole === 'admin';

    const {
      title,
      description,
      category,
      subcategory,
      brand,
      model,
      images,
      sharingType,
      condition,
      location,
      coordinates,
      borrowSettings,
      exchangeDetails,
      specifications
    } = req.body;

    // Rules validation
    if (rules.customerUploadAllowed === false && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Product listing uploads by customers are currently disabled by platform administration.'
      });
    }

    if (rules.requiredTitle && (!title || !title.trim())) {
      return res.status(400).json({ success: false, message: 'Item title is required.' });
    }

    if (rules.requiredDescription && (!description || !description.trim())) {
      return res.status(400).json({ success: false, message: 'Item description is required.' });
    }

    if (rules.requiredCategory && !category) {
      return res.status(400).json({ success: false, message: 'Please select a category.' });
    }

    if (rules.requiredCondition && !condition) {
      return res.status(400).json({ success: false, message: 'Please select the item condition.' });
    }

    if (!images || !Array.isArray(images) || images.length < rules.minImages) {
      return res.status(400).json({
        success: false,
        message: `Please upload at least ${rules.minImages} photo(s) of the item.`
      });
    }

    if (images.length > rules.maxImages) {
      return res.status(400).json({
        success: false,
        message: `You can upload up to ${rules.maxImages} photos per item according to current settings.`
      });
    }

    if (rules.requiredPrimaryImage && !images.some(img => typeof img === 'object' && img.isPrimary)) {
      if (typeof images[0] === 'object') {
        images[0].isPrimary = true;
      }
    }

    if (rules.requiredSpecifications && (!specifications || !Array.isArray(specifications) || specifications.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Product specifications are required.'
      });
    }

    // Format sanitized images array
    const formattedImages = images.slice(0, rules.maxImages).map((img, index) => {
      if (typeof img === 'string') {
        return { url: img, isPrimary: index === 0 };
      }
      return {
        url: img.url,
        isPrimary: img.isPrimary !== undefined ? Boolean(img.isPrimary) : index === 0,
        caption: img.caption || ''
      };
    });

    const parsedCity = location?.city || (typeof location === 'string' ? location.split(',')[0] : 'Bengaluru');
    const locationObj = {
      city: parsedCity.trim(),
      district: location?.district || '',
      state: location?.state || '',
      locality: location?.locality || '',
      approximateAddress: typeof location === 'string' ? location : (location?.approximateAddress || `${parsedCity}`)
    };

    let geoCoords = [77.5946, 12.9716];
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      geoCoords = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (location?.coordinates && Array.isArray(location.coordinates)) {
      geoCoords = [Number(location.coordinates[0]), Number(location.coordinates[1])];
    }

    const userId = req.user?.id || req.user?._id;
    const ownerId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId();

    // Determine approval status
    let approvalStatus = 'APPROVED';
    let status = 'active';

    if (!isAdmin && rules.customerApprovalRequired) {
      approvalStatus = 'PENDING';
      status = 'pending moderation';
    }

    const newItemData = {
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      subcategory: subcategory ? subcategory.trim() : 'General',
      brand: brand ? brand.trim() : '',
      model: model ? model.trim() : '',
      images: formattedImages,
      sharingType: sharingType || 'give_away',
      condition: condition || 'good',
      availability: approvalStatus === 'APPROVED' ? 'Available' : 'Unavailable',
      status: status,
      approvalStatus: approvalStatus,
      rejectionReason: '',
      specifications: Array.isArray(specifications) ? specifications : [],
      location: locationObj,
      locationCoordinates: {
        type: 'Point',
        coordinates: geoCoords
      },
      owner: ownerId
    };

    // Only attach settings relevant to sharing type
    if (sharingType === 'borrow') {
      newItemData.borrowSettings = {
        maxDurationDays: Number(borrowSettings?.maxDurationDays) || 14,
        maxDurationUnit: borrowSettings?.maxDurationUnit || 'days',
        notes: borrowSettings?.notes ? borrowSettings.notes.trim() : ''
      };
    } else if (sharingType === 'exchange') {
      newItemData.exchangeDetails = {
        wantedItems: exchangeDetails?.wantedItems ? exchangeDetails.wantedItems.trim() : ''
      };
    }

    // Attempt database save if MongoDB is connected, otherwise return structured object
    let savedItem;
    if (mongoose.connection.readyState === 1) {
      const itemDoc = new Item(newItemData);
      savedItem = await itemDoc.save();

      // Trigger matching against active WantedItems asynchronously
      matchingService.triggerMatchingForItem(savedItem).catch((err) => {
        console.error('[itemController] Error triggering matching for item:', err.message);
      });
    } else {
      // In standalone / disconnected dev environment
      savedItem = {
        ...newItemData,
        _id: `item-${Date.now()}`,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const message = approvalStatus === 'PENDING'
      ? 'Your item has been submitted and is pending admin approval before going live.'
      : 'Your item has been shared with the community!';

    return res.status(201).json({
      success: true,
      message,
      item: savedItem
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({
      success: false,
      message: 'We couldn’t publish your item right now. Please try again.'
    });
  }
};

const { calculateHaversineDistance, resolveCoordinates } = require('../utils/geoUtils');

exports.getItems = async (req, res) => {
  try {
    const {
      category,
      sharingType,
      condition,
      search,
      lat,
      lng,
      city,
      locality,
      state,
      radius = 10,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { status: 'active', availability: 'Available' };

    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }
    if (sharingType && sharingType !== 'all') {
      filter.sharingType = sharingType;
    }
    if (condition && condition !== 'all') {
      filter.condition = condition;
    }
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (mongoose.connection.readyState === 1) {
      let items = await Item.find(filter)
        .populate('owner', 'name avatar trustScore rating')
        .lean();

      // Resolve customer location coordinates
      const custCoords = resolveCoordinates({ lat, lng, city, locality, state });
      const maxRadius = Number(radius) || 10;

      // Calculate geographic Haversine distance for each item
      const processedItems = items.map((item) => {
        let itemLat = 12.9716;
        let itemLng = 77.5946;

        if (
          item.locationCoordinates &&
          Array.isArray(item.locationCoordinates.coordinates) &&
          item.locationCoordinates.coordinates.length === 2
        ) {
          itemLng = Number(item.locationCoordinates.coordinates[0]);
          itemLat = Number(item.locationCoordinates.coordinates[1]);
        } else {
          const itemLoc = resolveCoordinates(item.location || item.city);
          itemLat = itemLoc.lat;
          itemLng = itemLoc.lng;
        }

        const distanceKm = calculateHaversineDistance(custCoords.lat, custCoords.lng, itemLat, itemLng);
        const itemCity = item.location?.city || item.location?.locality || 'Local Area';
        const formattedDistance = distanceKm < 1 ? 'Under 1 km away' : `${distanceKm} km away`;

        return {
          ...item,
          distanceKm,
          distanceText: formattedDistance,
          displayLocation: `${itemCity} · ${formattedDistance}`
        };
      });

      // Filter by radius if location is passed or default radius applies
      let filteredItems = processedItems;
      if (lat || lng || city || radius) {
        filteredItems = processedItems.filter((item) => item.distanceKm <= maxRadius);
      }

      // Sort by proximity (nearest first), then newest
      filteredItems.sort((a, b) => {
        if (Math.abs(a.distanceKm - b.distanceKm) > 0.1) {
          return a.distanceKm - b.distanceKm;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Paginate
      const skip = (Number(page) - 1) * Number(limit);
      const paginatedItems = filteredItems.slice(skip, skip + Number(limit));

      return res.status(200).json({
        success: true,
        items: paginatedItems,
        total: filteredItems.length,
        page: Number(page),
        totalPages: Math.ceil(filteredItems.length / Number(limit)) || 1,
        userLocation: custCoords,
        searchRadiusKm: maxRadius
      });
    }

    return res.status(200).json({
      success: true,
      items: [],
      total: 0
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location-relevant items.'
    });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let item = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        item = await Item.findById(id).populate('owner', 'name avatar trustScore rating responseRate');
      }
      if (!item) {
        const cleanSlug = String(id).trim();
        const titleRegexPattern = cleanSlug.replace(/-/g, '[ -]');
        item = await Item.findOne({
          $or: [
            { slug: cleanSlug },
            { id: cleanSlug },
            { title: new RegExp(`^${titleRegexPattern}$`, 'i') }
          ]
        }).populate('owner', 'name avatar trustScore rating responseRate');
      }

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.'
        });
      }
      return res.status(200).json({
        success: true,
        item
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Item not found.'
    });
  } catch (error) {
    console.error('Error fetching item by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch item details.'
    });
  }
};

/**
 * Fetch items owned by currently authenticated user
 * Derives ownership strictly from req.user
 */
exports.getMyItems = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session missing.'
      });
    }

    const {
      search = '',
      category = 'all',
      sharingType = 'all',
      condition = 'all',
      status = 'all',
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { owner: userId };

    // By default exclude soft-deleted items unless specifically requested
    if (status !== 'removed') {
      query.status = { $ne: 'removed' };
    }

    // Status filter mapping
    if (status && status !== 'all') {
      if (status === 'available') {
        query.availability = 'Available';
        query.status = 'active';
      } else if (status === 'unavailable') {
        query.availability = 'Unavailable';
      } else if (status === 'pending') {
        query.status = 'pending moderation';
      } else if (status === 'borrowed') {
        query.availability = 'Reserved';
      } else if (status === 'completed') {
        query.status = 'completed';
      } else if (status === 'removed') {
        query.status = 'removed';
      }
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    // Sharing type filter
    if (sharingType && sharingType !== 'all') {
      query.sharingType = sharingType;
    }

    // Condition filter
    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    // Keyword search in title or description
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { subcategory: regex }, { brand: regex }];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'recently_updated') {
      sortOptions = { updatedAt: -1 };
    } else if (sort === 'alphabetical') {
      sortOptions = { title: 1 };
    }

    if (mongoose.connection.readyState === 1) {
      const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
      const items = await Item.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

      const total = await Item.countDocuments(query);

      return res.status(200).json({
        success: true,
        items,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1
      });
    }

    return res.status(200).json({
      success: true,
      items: [],
      total: 0,
      page: 1,
      limit: Number(limit),
      totalPages: 1
    });
  } catch (error) {
    console.error('Error in getMyItems:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your items right now.'
    });
  }
};

/**
 * Aggregated summary statistics of user listings
 */
exports.getMyItemsSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const total = await Item.countDocuments({ owner: userId, status: { $ne: 'removed' } });
      const available = await Item.countDocuments({ owner: userId, status: 'active', availability: 'Available' });
      const pending = await Item.countDocuments({ owner: userId, status: 'pending moderation' });
      const borrowed = await Item.countDocuments({ owner: userId, availability: 'Reserved', status: { $ne: 'removed' } });
      const completed = await Item.countDocuments({ owner: userId, status: 'completed' });

      return res.status(200).json({
        success: true,
        summary: {
          total,
          available,
          pending,
          borrowed,
          completed
        }
      });
    }

    return res.status(200).json({
      success: true,
      summary: {
        total: 0,
        available: 0,
        pending: 0,
        borrowed: 0,
        completed: 0
      }
    });
  } catch (error) {
    console.error('Error in getMyItemsSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load summary statistics.'
    });
  }
};

/**
 * Toggle listing availability (Available / Unavailable)
 */
exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;
    const { availability } = req.body;

    if (!['Available', 'Unavailable'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status.'
      });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.'
        });
      }

      // Enforce ownership
      if (item.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to modify this listing.'
        });
      }

      item.availability = availability;
      await item.save();

      // If item becomes unavailable, invalidate active matches
      if (availability !== 'Available') {
        matchingService.invalidateItemMatches(item._id).catch((err) => {
          console.error('[itemController] Error invalidating matches on availability change:', err.message);
        });
      }

      return res.status(200).json({
        success: true,
        message: `Listing marked as ${availability.toLowerCase()}.`,
        item
      });
    }

    return res.status(200).json({
      success: true,
      message: `Listing marked as ${availability.toLowerCase()}.`,
      item: { id, availability }
    });
  } catch (error) {
    console.error('Error in updateAvailability:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update item availability.'
    });
  }
};

/**
 * Soft delete / remove item from active discovery
 */
exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.'
        });
      }

      // Enforce ownership
      if (item.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to remove this listing.'
        });
      }

      // Soft delete to preserve historical integrity and request records
      item.status = 'removed';
      item.availability = 'Unavailable';
      await item.save();

      // Invalidate active matches
      matchingService.invalidateItemMatches(item._id).catch((err) => {
        console.error('[itemController] Error invalidating matches on delete:', err.message);
      });

      return res.status(200).json({
        success: true,
        message: 'Listing has been removed from active community discovery.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Listing has been removed from active community discovery.'
    });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove listing.'
    });
  }
};

/**
 * GET /api/items/discover
 * Real backend-powered, privacy-first community discovery endpoint.
 * Supports geospatial radius filtering ($geoNear / Haversine), text-based location fallback,
 * multi-attribute filtering, deterministic sorting, pagination, and privacy sanitization.
 */
exports.discoverItems = async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      sharingType,
      condition,
      city,
      district,
      state,
      radius = 25,
      latitude,
      longitude,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Bounds checking and sanitization
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const parsedRadius = Math.min(100, Math.max(1, parseFloat(radius) || 25));
    const skip = (parsedPage - 1) * parsedLimit;

    // Only discover available and active items
    const baseFilter = {
      status: 'active',
      availability: 'Available'
    };

    if (category && category !== 'all') {
      baseFilter.category = category.toLowerCase().trim();
    }
    if (subcategory && subcategory !== 'all') {
      baseFilter.subcategory = { $regex: new RegExp(`^${subcategory.trim()}$`, 'i') };
    }
    if (sharingType && sharingType !== 'all') {
      baseFilter.sharingType = sharingType.toLowerCase().trim();
    }
    if (condition && condition !== 'all') {
      baseFilter.condition = condition.toLowerCase().trim();
    }

    // Text search on title, description, or locality
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      baseFilter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.locality': searchRegex },
        { 'location.city': searchRegex }
      ];
    }

    // Check if valid client coordinates are provided
    const hasValidCoords =
      latitude !== undefined &&
      longitude !== undefined &&
      latitude !== '' &&
      longitude !== '' &&
      !isNaN(parseFloat(latitude)) &&
      !isNaN(parseFloat(longitude)) &&
      parseFloat(latitude) >= -90 &&
      parseFloat(latitude) <= 90 &&
      parseFloat(longitude) >= -180 &&
      parseFloat(longitude) <= 180;

    const userLat = hasValidCoords ? parseFloat(latitude) : null;
    const userLon = hasValidCoords ? parseFloat(longitude) : null;

    let items = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      if (hasValidCoords) {
        // Geospatial aggregation using $geoNear (distance in meters, converted to km)
        try {
          const maxDistanceMeters = parsedRadius * 1000;
          const pipeline = [
            {
              $geoNear: {
                near: {
                  type: 'Point',
                  coordinates: [userLon, userLat]
                },
                distanceField: 'distanceMeters',
                maxDistance: maxDistanceMeters,
                spherical: true,
                query: baseFilter
              }
            }
          ];

          // Deterministic Sorting
          if (sort === 'newest') {
            pipeline.push({ $sort: { createdAt: -1 } });
          } else if (sort === 'updated') {
            pipeline.push({ $sort: { updatedAt: -1 } });
          } else {
            // 'nearest' or 'relevant' defaults to distance ascending
            pipeline.push({ $sort: { distanceMeters: 1 } });
          }

          // Count facet and paginated results
          pipeline.push({
            $facet: {
              metadata: [{ $count: 'total' }],
              data: [
                { $skip: skip },
                { $limit: parsedLimit },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'ownerDoc'
                  }
                },
                {
                  $unwind: {
                    path: '$ownerDoc',
                    preserveNullAndEmptyArrays: true
                  }
                }
              ]
            }
          });

          const aggregateResult = await Item.aggregate(pipeline);
          const meta = aggregateResult[0]?.metadata[0];
          total = meta ? meta.total : 0;
          const rawItems = aggregateResult[0]?.data || [];

          items = rawItems.map((raw) => {
            const distanceKm =
              raw.distanceMeters !== undefined
                ? Math.round((raw.distanceMeters / 1000) * 10) / 10
                : null;

            return {
              _id: raw._id,
              id: raw._id,
              title: raw.title,
              description: raw.description,
              category: raw.category,
              subcategory: raw.subcategory,
              brand: raw.brand || '',
              model: raw.model || '',
              images: raw.images || [],
              sharingType: raw.sharingType,
              condition: raw.condition,
              availability: raw.availability,
              createdAt: raw.createdAt,
              updatedAt: raw.updatedAt,
              distanceKm,
              // Privacy-preserving location: approximate locality & city only
              location: {
                city: raw.location?.city || '',
                locality: raw.location?.locality || '',
                district: raw.location?.district || '',
                state: raw.location?.state || '',
                approximateAddress: raw.location?.locality
                  ? `${raw.location.locality}, ${raw.location.city || ''}`
                  : (raw.location?.city || '')
              },
              locationCoordinates: raw.locationCoordinates,
              owner: raw.ownerDoc
                ? {
                    _id: raw.ownerDoc._id,
                    name: raw.ownerDoc.name,
                    avatar: raw.ownerDoc.avatar,
                    trustScore: raw.ownerDoc.trustScore,
                    rating: raw.ownerDoc.rating,
                    reviewsCount: raw.ownerDoc.reviewsCount
                  }
                : null
            };
          });
        } catch (geoErr) {
          console.warn('[itemController] $geoNear fallback to query matching:', geoErr.message);
          items = [];
        }
      }

      // If not using geoNear or geoNear returned empty/failed, execute standard query
      if (!hasValidCoords || (items.length === 0 && total === 0)) {
        // Location text filters if coordinates are not provided
        if (city && city.trim() && city.toLowerCase() !== 'all') {
          baseFilter['location.city'] = { $regex: new RegExp(city.trim(), 'i') };
        }
        if (district && district.trim()) {
          baseFilter['location.district'] = { $regex: new RegExp(district.trim(), 'i') };
        }
        if (state && state.trim()) {
          baseFilter['location.state'] = { $regex: new RegExp(state.trim(), 'i') };
        }

        let sortObj = { createdAt: -1 };
        if (sort === 'updated') {
          sortObj = { updatedAt: -1 };
        }

        const rawItems = await Item.find(baseFilter)
          .sort(sortObj)
          .skip(skip)
          .limit(parsedLimit)
          .populate('owner', 'name avatar trustScore rating reviewsCount');

        total = await Item.countDocuments(baseFilter);

        items = rawItems.map((item) => {
          let calculatedDist = null;
          if (hasValidCoords && item.locationCoordinates?.coordinates) {
            calculatedDist = matchingService.calculateHaversineDistanceKm(
              [userLon, userLat],
              item.locationCoordinates.coordinates
            );
          }

          return {
            _id: item._id,
            id: item._id,
            title: item.title,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory,
            brand: item.brand || '',
            model: item.model || '',
            images: item.images || [],
            sharingType: item.sharingType,
            condition: item.condition,
            availability: item.availability,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            distanceKm: calculatedDist,
            location: {
              city: item.location?.city || '',
              locality: item.location?.locality || '',
              district: item.location?.district || '',
              state: item.location?.state || '',
              approximateAddress: item.location?.locality
                ? `${item.location.locality}, ${item.location.city || ''}`
                : (item.location?.city || '')
            },
            locationCoordinates: item.locationCoordinates,
            owner: item.owner
          };
        });
      }
    }

    return res.status(200).json({
      success: true,
      items,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      limit: parsedLimit,
      radius: parsedRadius,
      hasCoordinates: hasValidCoords
    });
  } catch (error) {
    console.error('Error in discoverItems:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to discover items.'
    });
  }
};

/**
 * GET /api/items/nearby
 * Convenience alias for discovering items within proximity
 */
exports.getNearbyItems = async (req, res) => {
  return exports.discoverItems(req, res);
};

/**
 * GET /api/items/:id/matches
 * Retrieves active WantedItem requests from neighbors that match this Item
 */
exports.getItemMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { minScore = 40, radius } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID.'
      });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    const matches = await matchingService.findMatchesForItem(item, {
      minScore: parseInt(minScore, 10) || 40,
      radiusKm: radius ? parseFloat(radius) : undefined
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error in getItemMatches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve item matches.'
    });
  }
};

/**
 * GET /api/items/:id/similar or GET /api/items/similar
 * Returns similar available items based on category, subcategory, brand, sharing type, and condition
 * Prioritizes AVAILABLE items over reserved/reused ones.
 */
exports.getSimilarItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, subcategory, brand, sharingType, condition, limit = 8 } = req.query;
    const parsedLimit = Math.min(24, Math.max(1, parseInt(limit, 10) || 8));

    let sourceCategory = category || '';
    let sourceSubcategory = subcategory || '';
    let sourceBrand = brand || '';
    let sourceSharingType = sharingType || '';
    let sourceCondition = condition || '';
    let excludeId = null;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      excludeId = id;
      if (mongoose.connection.readyState === 1) {
        const sourceItem = await Item.findById(id);
        if (sourceItem) {
          sourceCategory = sourceCategory || sourceItem.category || '';
          sourceSubcategory = sourceSubcategory || sourceItem.subcategory || '';
          sourceBrand = sourceBrand || sourceItem.brand || '';
          sourceSharingType = sourceSharingType || sourceItem.sharingType || '';
          sourceCondition = sourceCondition || sourceItem.condition || '';
        }
      }
    }

    const filter = {
      status: { $ne: 'removed' }
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    if (sourceCategory && sourceCategory !== 'all') {
      filter.category = sourceCategory.toLowerCase().trim();
    }

    let rawItems = [];
    if (mongoose.connection.readyState === 1) {
      rawItems = await Item.find(filter)
        .sort({ createdAt: -1 })
        .limit(40)
        .populate('owner', 'name avatar trustScore verified rating reviewsCount');
    }

    // Score and rank candidates
    const scoredItems = rawItems.map((item) => {
      let score = 0;
      const isAvailable = item.availability === 'Available' || item.status === 'active';

      // Priority 1: AVAILABLE items prioritized FIRST over reserved/reused ones
      if (isAvailable) score += 1000;

      if (sourceSubcategory && item.subcategory && item.subcategory.toLowerCase() === sourceSubcategory.toLowerCase()) {
        score += 50;
      }
      if (sourceBrand && item.brand && item.brand.toLowerCase() === sourceBrand.toLowerCase()) {
        score += 40;
      }
      if (sourceSharingType && item.sharingType === sourceSharingType) {
        score += 20;
      }
      if (sourceCondition && item.condition === sourceCondition) {
        score += 10;
      }

      return { item, score };
    });

    scoredItems.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.item.createdAt || 0) - new Date(a.item.createdAt || 0);
    });

    const items = scoredItems.slice(0, parsedLimit).map((s) => ({
      ...s.item.toObject(),
      id: s.item._id
    }));

    return res.status(200).json({
      success: true,
      items,
      total: items.length
    });
  } catch (error) {
    console.error('Error in getSimilarItems:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve similar items.'
    });
  }
};
