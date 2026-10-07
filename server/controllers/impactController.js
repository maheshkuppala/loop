const mongoose = require('mongoose');
const ImpactFactor = require('../models/ImpactFactor');
const ImpactEvent = require('../models/ImpactEvent');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const environmentalImpactService = require('../services/environmentalImpactService');
const { logAction } = require('../services/adminAuditService');

/**
 * LOOOP Environmental Impact Controller
 * Transparent, deterministic impact metrics based on real MongoDB data.
 */

// 1. Get authenticated user's impact summary (GET /api/impact/me)
exports.getMyImpact = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const summary = await environmentalImpactService.getUserImpactSummary(userId);

    return res.status(200).json({
      success: true,
      ...summary
    });
  } catch (error) {
    console.error('Error in getMyImpact:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your environmental impact summary.'
    });
  }
};

// 2. Get authenticated user's impact history with pagination (GET /api/impact/me/history)
exports.getMyImpactHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { page = 1, limit = 10, type, category } = req.query;

    const data = await environmentalImpactService.getUserImpactHistory(userId, {
      page,
      limit,
      type,
      category
    });

    return res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Error in getMyImpactHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve impact history.'
    });
  }
};

// 3. Get authenticated user's activity trends (GET /api/impact/me/trends)
exports.getMyImpactTrends = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { range = '6m' } = req.query;
    const trends = await environmentalImpactService.getUserImpactTrends(userId, { range });

    return res.status(200).json({
      success: true,
      range,
      trends
    });
  } catch (error) {
    console.error('Error in getMyImpactTrends:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve impact trends.'
    });
  }
};

// 4. Public platform-wide impact summary (GET /api/impact/summary)
exports.getPlatformSummary = async (req, res) => {
  try {
    const summary = await environmentalImpactService.getPlatformImpactSummary();
    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error in getPlatformSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve community impact summary.'
    });
  }
};

// 5. Public profile impact summary for a specific user (GET /api/impact/user/:id)
exports.getUserPublicImpact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = await User.findById(id).select('name profileVisibility accountStatus');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const summary = await environmentalImpactService.getUserImpactSummary(id);

    // Return safe public subset, strictly omitting any private details
    return res.status(200).json({
      success: true,
      impact: {
        completedReuseTransactions: summary.completedReuseTransactions,
        itemsShared: summary.itemsShared,
        itemsReceived: summary.itemsReceived,
        totalItemsReused: summary.totalItemsReused,
        environmentalMetrics: summary.environmentalMetrics,
        milestones: summary.milestones.filter((m) => m.achieved),
        methodologyVersion: summary.methodologyVersion
      }
    });
  } catch (error) {
    console.error('Error in getUserPublicImpact:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user impact.'
    });
  }
};

// -------------------------------------------------------------
// ADMIN ENDPOINTS (Requires admin role)
// -------------------------------------------------------------

// 6. Admin get impact summary & statistics (GET /api/admin/impact/summary)
exports.getAdminImpactSummary = async (req, res) => {
  try {
    const summary = await environmentalImpactService.getPlatformImpactSummary();
    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error in getAdminImpactSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin impact summary.'
    });
  }
};

// 7. Admin get platform trends (GET /api/admin/impact/trends)
exports.getAdminImpactTrends = async (req, res) => {
  try {
    const { range = '12m' } = req.query;
    const trends = await environmentalImpactService.getPlatformImpactTrends({ range });
    return res.status(200).json({
      success: true,
      range,
      trends
    });
  } catch (error) {
    console.error('Error in getAdminImpactTrends:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load platform trends.'
    });
  }
};

// 8. Admin get all configured impact factors (GET /api/admin/impact/factors)
exports.getImpactFactors = async (req, res) => {
  try {
    const factors = await ImpactFactor.find().sort({ category: 1, metricType: 1 });
    return res.status(200).json({
      success: true,
      count: factors.length,
      factors
    });
  } catch (error) {
    console.error('Error in getImpactFactors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve impact factors.'
    });
  }
};

// 9. Admin create impact factor (POST /api/admin/impact/factors)
exports.createImpactFactor = async (req, res) => {
  try {
    const { category, metricType, value, unit, basis, source, methodologyVersion, description, active } = req.body;

    if (!category || !metricType || value === undefined || !unit || !source) {
      return res.status(400).json({
        success: false,
        message: 'Category, metricType, value, unit, and source are required.'
      });
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Factor value must be a non-negative number.'
      });
    }

    const factor = await ImpactFactor.create({
      category: category.trim(),
      metricType,
      value: numVal,
      unit: unit.trim(),
      basis: (basis || 'per item reused').trim(),
      source: source.trim(),
      methodologyVersion: methodologyVersion ? methodologyVersion.trim() : '1.0',
      description: description ? description.trim() : '',
      active: active !== undefined ? Boolean(active) : true,
      createdBy: req.admin?._id || req.user?._id
    });

    // Record audit log
    await logAction({
      adminId: req.admin?._id || req.user?._id,
      action: 'CREATE_IMPACT_FACTOR',
      targetType: 'IMPACT_FACTOR',
      targetId: factor._id,
      targetTitle: `${factor.category} - ${factor.metricType}`,
      metadata: {
        category: factor.category,
        metricType: factor.metricType,
        value: factor.value,
        unit: factor.unit,
        source: factor.source
      },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Impact factor created successfully.',
      factor
    });
  } catch (error) {
    console.error('Error in createImpactFactor:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create impact factor.'
    });
  }
};

// 10. Admin update impact factor (PATCH /api/admin/impact/factors/:id)
exports.updateImpactFactor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Impact factor not found.' });
    }

    const factor = await ImpactFactor.findById(id);
    if (!factor) {
      return res.status(404).json({ success: false, message: 'Impact factor not found.' });
    }

    const previousState = {
      category: factor.category,
      metricType: factor.metricType,
      value: factor.value,
      unit: factor.unit,
      active: factor.active,
      factorVersion: factor.factorVersion
    };

    const { category, metricType, value, unit, basis, source, methodologyVersion, description, active } = req.body;

    if (category) factor.category = category.trim();
    if (metricType) factor.metricType = metricType;
    if (value !== undefined) {
      const numVal = parseFloat(value);
      if (isNaN(numVal) || numVal < 0) {
        return res.status(400).json({ success: false, message: 'Factor value must be non-negative.' });
      }
      factor.value = numVal;
      // Increment factorVersion when value changes for reproducibility
      factor.factorVersion = (factor.factorVersion || 1) + 1;
    }
    if (unit) factor.unit = unit.trim();
    if (basis) factor.basis = basis.trim();
    if (source) factor.source = source.trim();
    if (methodologyVersion) factor.methodologyVersion = methodologyVersion.trim();
    if (description !== undefined) factor.description = description.trim();
    if (active !== undefined) factor.active = Boolean(active);

    await factor.save();

    // Audit log
    await logAction({
      adminId: req.admin?._id || req.user?._id,
      action: 'UPDATE_IMPACT_FACTOR',
      targetType: 'IMPACT_FACTOR',
      targetId: factor._id,
      targetTitle: `${factor.category} - ${factor.metricType}`,
      metadata: {
        previousState,
        newState: {
          category: factor.category,
          metricType: factor.metricType,
          value: factor.value,
          active: factor.active,
          factorVersion: factor.factorVersion
        }
      },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Impact factor updated successfully.',
      factor
    });
  } catch (error) {
    console.error('Error in updateImpactFactor:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update impact factor.'
    });
  }
};

// 11. Admin deactivate / delete impact factor (DELETE /api/admin/impact/factors/:id)
exports.deleteImpactFactor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Impact factor not found.' });
    }

    const factor = await ImpactFactor.findById(id);
    if (!factor) {
      return res.status(404).json({ success: false, message: 'Impact factor not found.' });
    }

    // Soft delete: Deactivate rather than delete to preserve historical integrity
    factor.active = false;
    await factor.save();

    await logAction({
      adminId: req.admin?._id || req.user?._id,
      action: 'DEACTIVATE_IMPACT_FACTOR',
      targetType: 'IMPACT_FACTOR',
      targetId: factor._id,
      targetTitle: `${factor.category} - ${factor.metricType}`,
      metadata: { factorId: factor._id, active: false },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Impact factor deactivated successfully.',
      factor
    });
  } catch (error) {
    console.error('Error in deleteImpactFactor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate impact factor.'
    });
  }
};

// 12. Admin recalculate impact for a transaction (POST /api/admin/impact/recalculate/:transactionId)
exports.recalculateTransactionImpact = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason = 'Admin recalculated impact with active factors' } = req.body;

    const updatedEvent = await environmentalImpactService.recalculateImpactForTransaction(transactionId);

    await logAction({
      adminId: req.admin?._id || req.user?._id,
      action: 'RECALCULATE_IMPACT_EVENT',
      targetType: 'IMPACT_EVENT',
      targetId: updatedEvent._id,
      targetTitle: `Transaction ${transactionId}`,
      metadata: { transactionId, reason, metrics: updatedEvent.metrics },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Impact successfully recalculated.',
      impactEvent: updatedEvent
    });
  } catch (error) {
    console.error('Error in recalculateTransactionImpact:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to recalculate impact.'
    });
  }
};
