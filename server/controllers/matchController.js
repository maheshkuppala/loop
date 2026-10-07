const mongoose = require('mongoose');
const Match = require('../models/Match');

/**
 * Match Controller
 * Handles user match feeds, match inspection, and match dismissal
 */

/**
 * GET /api/matches
 * Returns user's active matches (as either item owner or wanted requester)
 */
exports.getMyMatches = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    const { role = 'all', status = 'ACTIVE', limit = 20, page = 1 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = { status };
    if (role === 'requester') {
      query.requester = userId;
    } else if (role === 'owner') {
      query.itemOwner = userId;
    } else {
      query.$or = [{ requester: userId }, { itemOwner: userId }];
    }

    const matches = await Match.find(query)
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate('item', 'title images category sharingType condition availability location status')
      .populate('wantedItem', 'title category preferredSharingType conditionPreference urgency status expiresAt')
      .populate('itemOwner', 'name avatar trustScore rating')
      .populate('requester', 'name avatar trustScore rating');

    const total = await Match.countDocuments(query);

    return res.status(200).json({
      success: true,
      matches,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1
    });
  } catch (error) {
    console.error('Error in getMyMatches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve matches.'
    });
  }
};

/**
 * GET /api/matches/:id
 * Retrieve specific match detail
 */
exports.getMatchById = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID.'
      });
    }

    const match = await Match.findById(id)
      .populate('item', 'title description images category subcategory sharingType condition availability location status')
      .populate('wantedItem', 'title description category subcategory preferredSharingType conditionPreference urgency status')
      .populate('itemOwner', 'name avatar trustScore rating')
      .populate('requester', 'name avatar trustScore rating');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found.'
      });
    }

    // Access control: only participants or admin can view
    const isOwner = match.itemOwner?._id?.toString() === userId.toString();
    const isRequester = match.requester?._id?.toString() === userId.toString();
    if (!isOwner && !isRequester && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this match.'
      });
    }

    return res.status(200).json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Error in getMatchById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve match.'
    });
  }
};

/**
 * PATCH /api/matches/:id/dismiss
 * Dismiss a match so it does not appear in active feeds
 */
exports.dismissMatch = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID.'
      });
    }

    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found.'
      });
    }

    // Verify participant
    const isOwner = match.itemOwner?.toString() === userId.toString();
    const isRequester = match.requester?.toString() === userId.toString();
    if (!isOwner && !isRequester && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to dismiss this match.'
      });
    }

    match.status = 'DISMISSED';
    await match.save();

    return res.status(200).json({
      success: true,
      message: 'Match dismissed.',
      match
    });
  } catch (error) {
    console.error('Error in dismissMatch:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dismiss match.'
    });
  }
};
