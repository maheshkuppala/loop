const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const Item = require('../models/Item');

/**
 * 1. Submit a Report for a User or Item
 * POST /api/reports
 */
exports.createReport = async (req, res) => {
  try {
    const reporterId = req.user?.id || req.user?._id;
    if (!reporterId) {
      return res.status(401).json({ success: false, message: 'Authentication required to submit reports.' });
    }

    const { targetType, targetId, userId, itemId, reason, description } = req.body;

    const resolvedType = (targetType || (userId ? 'USER' : itemId ? 'ITEM' : '')).toUpperCase();
    const resolvedId = targetId || userId || itemId;

    if (!resolvedType || !['USER', 'ITEM'].includes(resolvedType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type. Must be USER or ITEM.'
      });
    }

    if (!resolvedId || !mongoose.Types.ObjectId.isValid(resolvedId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid target ID is required.'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for this report.'
      });
    }

    // Verify target existence
    if (resolvedType === 'USER') {
      const userExists = await User.findById(resolvedId);
      if (!userExists) {
        return res.status(404).json({ success: false, message: 'Reported user does not exist.' });
      }
      if (userExists._id.toString() === reporterId.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot report your own profile.' });
      }
    } else if (resolvedType === 'ITEM') {
      const itemExists = await Item.findById(resolvedId);
      if (!itemExists) {
        return res.status(404).json({ success: false, message: 'Reported item does not exist.' });
      }
    }

    const report = await Report.create({
      reporter: reporterId,
      targetType: resolvedType,
      targetUser: resolvedType === 'USER' ? resolvedId : null,
      targetItem: resolvedType === 'ITEM' ? resolvedId : null,
      reason: reason.trim(),
      description: typeof description === 'string' ? description.trim().slice(0, 1000) : ''
    });

    return res.status(201).json({
      success: true,
      message: 'Your report has been submitted to community moderation. Thank you for keeping LOOOP safe!',
      report: {
        id: report._id,
        _id: report._id,
        targetType: report.targetType,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit report. Please try again later.'
    });
  }
};

/**
 * 2. Get Reports (Admin)
 * GET /api/reports
 */
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email avatar')
      .populate('targetUser', 'name email avatar')
      .populate('targetItem', 'title category')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve reports.'
    });
  }
};
