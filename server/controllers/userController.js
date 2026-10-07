const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');
const WantedItem = require('../models/WantedItem');

/**
 * Sanitizer utility to prevent script injection in text fields
 */
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .trim();
};

/**
 * Deterministically compute profile completion percentage
 * based strictly on real profile fields.
 */
const calculateProfileCompletion = (user) => {
  const steps = [];

  // 1. Name present and valid
  const hasName = !!user.name && user.name.trim().length >= 2;
  steps.push({ field: 'name', label: 'Full Name', completed: hasName, weight: 20 });

  // 2. Avatar set (not empty and not default blank)
  const hasAvatar = !!user.avatar && user.avatar.trim().length > 0;
  steps.push({ field: 'avatar', label: 'Profile Photo', completed: hasAvatar, weight: 20 });

  // 3. Bio written (at least 10 chars)
  const hasBio = !!user.bio && user.bio.trim().length >= 10;
  steps.push({ field: 'bio', label: 'About Me / Bio', completed: hasBio, weight: 20 });

  // 4. Location provided (city and state)
  const hasLocation = !!user.city && !!user.state && user.city.trim().length > 0 && user.state.trim().length > 0;
  steps.push({ field: 'location', label: 'City & State', completed: hasLocation, weight: 20 });

  // 5. At least one community interest listed
  const hasInterests = Array.isArray(user.interests) && user.interests.length > 0;
  steps.push({ field: 'interests', label: 'Sharing Interests', completed: hasInterests, weight: 20 });

  const percentage = steps.reduce((sum, step) => (step.completed ? sum + step.weight : sum), 0);

  return {
    percentage,
    steps
  };
};

/**
 * Safe public user serializer.
 * Strips all sensitive information: email, password, phone, exact address, security metadata.
 */
const toPublicUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : user;

  return {
    id: userObj._id,
    _id: userObj._id,
    name: userObj.name,
    avatar: userObj.avatar || '',
    bio: userObj.bio || '',
    city: userObj.city || '',
    state: userObj.state || '',
    interests: userObj.interests || [],
    memberSince: userObj.createdAt,
    createdAt: userObj.createdAt,
    verified: !!userObj.verified,
    profileVisibility: userObj.profileVisibility || 'public',
    rating: userObj.rating || 0,
    reviewsCount: userObj.reviewsCount || 0
  };
};

/**
 * 1. Get current logged-in user profile with real database stats
 * GET /api/users/me
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('-password');
    }

    if (!user) {
      // If dev mock token with valid non-db id or fallback
      user = await User.findOne({ email: req.user.email }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    // Compute real MongoDB metrics
    const userObjectId = user._id;

    const [
      activeItemsCount,
      itemsSharedCount,
      completedTransactionsCount,
      wantedCount,
      reviewsReceivedCount,
      reviewAgg
    ] = await Promise.all([
      Item.countDocuments({ owner: userObjectId, status: 'AVAILABLE' }),
      Item.countDocuments({ owner: userObjectId }),
      Transaction.countDocuments({
        $or: [{ owner: userObjectId }, { recipient: userObjectId }],
        status: 'COMPLETED'
      }),
      WantedItem.countDocuments({ user: userObjectId }),
      Review.countDocuments({ reviewee: userObjectId }),
      Review.aggregate([
        { $match: { reviewee: userObjectId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            total: { $sum: 1 }
          }
        }
      ])
    ]);

    const averageRating = reviewAgg.length > 0 ? Math.round(reviewAgg[0].averageRating * 10) / 10 : 0;
    const completion = calculateProfileCompletion(user);

    // Synchronize rating in User document if different
    if (user.rating !== averageRating || user.reviewsCount !== reviewsReceivedCount) {
      await User.findByIdAndUpdate(userObjectId, {
        rating: averageRating,
        reviewsCount: reviewsReceivedCount
      });
      user.rating = averageRating;
      user.reviewsCount = reviewsReceivedCount;
    }

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      user: safeUser,
      stats: {
        activeItems: activeItemsCount,
        itemsShared: itemsSharedCount,
        completedTransactions: completedTransactionsCount,
        wantedRequests: wantedCount,
        reviewsReceived: reviewsReceivedCount,
        averageRating
      },
      profileCompletion: completion
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve user profile.'
    });
  }
};

/**
 * 2. Update current logged-in user profile
 * PATCH /api/users/me
 */
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const {
      name,
      bio,
      city,
      locality,
      state,
      interests,
      profileVisibility,
      avatar
    } = req.body;

    // Field-level validations and sanitization
    if (name !== undefined) {
      const cleanName = sanitizeText(name);
      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
      }
      if (cleanName.length > 80) {
        return res.status(400).json({ success: false, message: 'Name cannot exceed 80 characters.' });
      }
      user.name = cleanName;
    }

    if (bio !== undefined) {
      const cleanBio = sanitizeText(bio);
      if (cleanBio.length > 500) {
        return res.status(400).json({ success: false, message: 'Bio cannot exceed 500 characters.' });
      }
      user.bio = cleanBio;
    }

    if (city !== undefined) {
      user.city = sanitizeText(city).slice(0, 80);
    }

    if (locality !== undefined) {
      user.locality = sanitizeText(locality).slice(0, 100);
    }

    if (state !== undefined) {
      user.state = sanitizeText(state).slice(0, 80);
    }

    if (avatar !== undefined && typeof avatar === 'string') {
      user.avatar = avatar.trim();
    }

    if (interests !== undefined && Array.isArray(interests)) {
      user.interests = interests
        .map((i) => sanitizeText(i))
        .filter((i) => i.length > 0 && i.length <= 40)
        .slice(0, 15);
    }

    if (profileVisibility !== undefined) {
      if (['public', 'community'].includes(profileVisibility)) {
        user.profileVisibility = profileVisibility;
      }
    }

    await user.save();

    const completion = calculateProfileCompletion(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser,
      profileCompletion: completion
    });
  } catch (error) {
    console.error('Error in updateMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update profile.'
    });
  }
};

/**
 * 3. Get Public Profile of any user
 * GET /api/users/:id
 */
exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Privacy Enforcement:
    // If profile visibility is 'community', check if requester is logged in
    const isOwner = req.user && (req.user.id?.toString() === id || req.user._id?.toString() === id);
    if (user.profileVisibility === 'community' && !req.user && !isOwner) {
      return res.status(200).json({
        success: true,
        isRestricted: true,
        message: 'This member has set their profile visibility to community members only.',
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          profileVisibility: 'community'
        }
      });
    }

    const userObjectId = user._id;

    // Fetch real metrics in parallel from MongoDB
    const [
      activeItems,
      completedTransactionsCount,
      itemsSharedCount,
      reviewAgg,
      reviewDistribution
    ] = await Promise.all([
      Item.find({ owner: userObjectId, status: 'AVAILABLE' })
        .select('title images category condition sharingType location createdAt')
        .sort({ createdAt: -1 })
        .limit(8),
      Transaction.countDocuments({
        $or: [{ owner: userObjectId }, { recipient: userObjectId }],
        status: 'COMPLETED'
      }),
      Item.countDocuments({ owner: userObjectId }),
      Review.aggregate([
        { $match: { reviewee: userObjectId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            total: { $sum: 1 }
          }
        }
      ]),
      Review.aggregate([
        { $match: { reviewee: userObjectId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const averageRating = reviewAgg.length > 0 ? Math.round(reviewAgg[0].averageRating * 10) / 10 : 0;
    const totalReviews = reviewAgg.length > 0 ? reviewAgg[0].total : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewDistribution.forEach((d) => {
      if (distribution[d._id] !== undefined) {
        distribution[d._id] = d.count;
      }
    });

    const publicUser = toPublicUser(user);
    publicUser.rating = averageRating;
    publicUser.reviewsCount = totalReviews;

    return res.status(200).json({
      success: true,
      isRestricted: false,
      user: publicUser,
      stats: {
        completedTransactions: completedTransactionsCount,
        activeItems: activeItems.length,
        itemsShared: itemsSharedCount,
        totalReviews,
        averageRating
      },
      reviewSummary: {
        averageRating,
        totalReviews,
        distribution
      },
      publicItems: activeItems.map((item) => ({
        id: item._id,
        _id: item._id,
        title: item.title,
        images: item.images,
        category: item.category,
        condition: item.condition,
        sharingType: item.sharingType,
        location: item.location,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in getPublicProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve member profile.'
    });
  }
};

module.exports = {
  ...exports,
  toPublicUser
};
