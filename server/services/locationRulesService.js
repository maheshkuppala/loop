const AdminSetting = require('../models/AdminSetting');

const DEFAULT_LOCATION_RULES = {
  enableLocationBrowsing: true,
  requireLocation: true,
  useGPS: true,
  manualLocationAllowed: true,
  defaultSearchRadiusKm: 10,
  maxSearchRadiusKm: 50,
  minAcceptableAccuracyMeters: 1000
};

exports.DEFAULT_LOCATION_RULES = DEFAULT_LOCATION_RULES;

/**
 * Get location governance rules dynamically from DB or default
 */
exports.getLocationRules = async () => {
  try {
    const settingDoc = await AdminSetting.findOne({ key: 'admin_location_rules' }).lean();
    if (settingDoc && settingDoc.value) {
      return {
        ...DEFAULT_LOCATION_RULES,
        ...settingDoc.value
      };
    }
  } catch (err) {
    console.error('[LocationRulesService] Error fetching location rules:', err.message);
  }
  return { ...DEFAULT_LOCATION_RULES };
};

/**
 * Update location governance rules (Admin ONLY)
 */
exports.updateLocationRules = async (updates, adminId) => {
  const currentRules = await exports.getLocationRules();

  const nextRules = {
    ...currentRules,
    enableLocationBrowsing: updates.enableLocationBrowsing !== undefined ? Boolean(updates.enableLocationBrowsing) : currentRules.enableLocationBrowsing,
    requireLocation: updates.requireLocation !== undefined ? Boolean(updates.requireLocation) : currentRules.requireLocation,
    useGPS: updates.useGPS !== undefined ? Boolean(updates.useGPS) : currentRules.useGPS,
    manualLocationAllowed: updates.manualLocationAllowed !== undefined ? Boolean(updates.manualLocationAllowed) : currentRules.manualLocationAllowed,
    defaultSearchRadiusKm: updates.defaultSearchRadiusKm !== undefined ? Math.max(1, Math.min(500, parseInt(updates.defaultSearchRadiusKm, 10) || 10)) : currentRules.defaultSearchRadiusKm,
    maxSearchRadiusKm: updates.maxSearchRadiusKm !== undefined ? Math.max(5, Math.min(1000, parseInt(updates.maxSearchRadiusKm, 10) || 50)) : currentRules.maxSearchRadiusKm,
    minAcceptableAccuracyMeters: updates.minAcceptableAccuracyMeters !== undefined ? Math.max(50, Math.min(10000, parseInt(updates.minAcceptableAccuracyMeters, 10) || 1000)) : currentRules.minAcceptableAccuracyMeters
  };

  const updatedSetting = await AdminSetting.findOneAndUpdate(
    { key: 'admin_location_rules' },
    {
      key: 'admin_location_rules',
      value: nextRules,
      label: 'Location Governance & Distance Filtering Rules',
      description: 'Admin configuration for GPS accuracy tolerances, radius parameters, and location enforcement',
      category: 'LOCATION_RULES',
      updatedBy: adminId || null
    },
    { upsert: true, new: true }
  );

  return updatedSetting.value;
};
