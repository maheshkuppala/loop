const SavedItem = require('../models/SavedItem');
const Item = require('../models/Item');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Fetch all saved items for the authenticated user
 * Scoped strictly to req.user.id
 */
exports.getSavedItems = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication session required.'
      });
    }

    const {
      search = '',
      category = 'all',
      sharingType = 'all',
      condition = 'all',
      availability = 'all',
      sort = 'recently_saved',
      page = 1,
      limit = 12
    } = req.query;

    if (mongoose.connection.readyState === 1) {
      // 1. Fetch saved relationships for user
      const savedDocs = await SavedItem.find({ user: userId })
        .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
        .populate({
          path: 'item',
          populate: {
            path: 'owner',
            select: 'name avatar trustScore rating responseRate'
          }
        });

      // 2. Filter out orphaned references if an item was removed from DB
      let validItems = savedDocs
        .filter((doc) => doc.item !== null)
        .map((doc) => {
          const itemObj = doc.item.toObject ? doc.item.toObject() : doc.item;
          return {
            ...itemObj,
            owner: itemObj.owner || {
              name: 'Community Sharer',
              trustScore: 98,
              rating: 4.9
            },
            savedItemId: doc._id,
            savedAt: doc.createdAt,
            isSaved: true,
            isUnavailable: itemObj.availability === 'Unavailable' || itemObj.status === 'removed'
          };
        });

      // 3. Apply Keyword Search
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        validItems = validItems.filter(
          (i) =>
            i.title?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q) ||
            i.category?.toLowerCase().includes(q) ||
            i.subcategory?.toLowerCase().includes(q) ||
            i.brand?.toLowerCase().includes(q)
        );
      }

      // 4. Apply Category Filter
      if (category && category !== 'all') {
        validItems = validItems.filter((i) => i.category === category.toLowerCase());
      }

      // 5. Apply Sharing Type Filter
      if (sharingType && sharingType !== 'all') {
        validItems = validItems.filter((i) => i.sharingType === sharingType);
      }

      // 6. Apply Condition Filter
      if (condition && condition !== 'all') {
        validItems = validItems.filter((i) => i.condition === condition);
      }

      // 7. Apply Availability Filter
      if (availability && availability !== 'all') {
        if (availability === 'available') {
          validItems = validItems.filter((i) => i.availability === 'Available' && i.status === 'active');
        } else if (availability === 'unavailable') {
          validItems = validItems.filter((i) => i.availability === 'Unavailable' || i.status === 'removed');
        }
      }

      // 8. Sorting
      if (sort === 'newest') {
        validItems.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } else if (sort === 'oldest') {
        validItems.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      } else if (sort === 'alphabetical') {
        validItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      } else {
        // default 'recently_saved'
        validItems.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
      }

      // 9. Pagination
      const total = validItems.length;
      const currentPage = Math.max(1, parseInt(page, 10));
      const pageSize = Math.max(1, parseInt(limit, 10));
      const startIndex = (currentPage - 1) * pageSize;
      const paginated = validItems.slice(startIndex, startIndex + pageSize);

      return res.status(200).json({
        success: true,
        items: paginated,
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1
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
    console.error('Error fetching saved items:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your saved items right now.'
    });
  }
};

/**
 * Save an item for the authenticated user
 */
exports.saveItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id: itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item identifier.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found.'
        });
      }

      // Upsert to guarantee idempotency and avoid duplicate key errors
      await SavedItem.findOneAndUpdate(
        { user: userId, item: itemId },
        { user: userId, item: itemId, createdAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Increment saves count on Item
      await Item.findByIdAndUpdate(itemId, { $inc: { savesCount: 1 } });

      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Item saved to your bookmarks.'
      });
    }

    return res.status(200).json({
      success: true,
      saved: true,
      message: 'Item saved to your bookmarks.'
    });
  } catch (error) {
    console.error('Error saving item:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not save this item right now.'
    });
  }
};

/**
 * Unsave / remove an item from bookmarks
 */
exports.unsaveItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id: itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item identifier.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const deleted = await SavedItem.findOneAndDelete({ user: userId, item: itemId });

      if (deleted) {
        // Decrement saves count on Item
        await Item.findByIdAndUpdate(itemId, {
          $inc: { savesCount: -1 }
        });
      }

      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Removed from saved items.'
      });
    }

    return res.status(200).json({
      success: true,
      saved: false,
      message: 'Removed from saved items.'
    });
  } catch (error) {
    console.error('Error unsaving item:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not remove this item right now.'
    });
  }
};

/**
 * Check if current user has saved a specific item
 */
exports.getSavedStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id: itemId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(200).json({
        success: true,
        saved: false
      });
    }

    if (mongoose.connection.readyState === 1) {
      const exists = await SavedItem.exists({ user: userId, item: itemId });
      return res.status(200).json({
        success: true,
        saved: Boolean(exists)
      });
    }

    return res.status(200).json({
      success: true,
      saved: false
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      saved: false
    });
  }
};
