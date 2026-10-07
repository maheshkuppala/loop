const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Service to record administrative actions securely in MongoDB
 */
const logAction = async ({
  adminId,
  action,
  targetType,
  targetId = null,
  targetTitle = '',
  metadata = {},
  ipAddress = ''
}) => {
  try {
    // Sanitize metadata: remove any sensitive fields
    const sanitizedMetadata = { ...metadata };
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.token;
    delete sanitizedMetadata.jwt;
    delete sanitizedMetadata.secret;

    const logEntry = await AdminAuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId: targetId ? targetId.toString() : null,
      targetTitle,
      metadata: sanitizedMetadata,
      ipAddress
    });

    return logEntry;
  } catch (error) {
    console.error('Failed to write AdminAuditLog:', error.message);
    // Don't crash primary admin request if audit log write encounters error
    return null;
  }
};

module.exports = {
  logAction
};
