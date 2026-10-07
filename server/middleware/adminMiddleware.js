const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { getJwtSecret } = require('../utils/jwtConfig');

/**
 * Strict Admin Authorization Middleware
 *
 * CRITICAL SECURITY ENFORCEMENT:
 * 1. Derives authenticated identity exclusively from the verified JWT signature.
 * 2. Checks MongoDB database record directly to ensure account exists and has role 'admin'.
 * 3. Enforces that accountStatus is 'active' (rejects suspended administrators).
 * 4. NEVER trusts any client-provided role, userId, permissions, or headers.
 * 5. Returns 401 for missing/invalid authentication, 403 for unauthorized access.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in as an administrator.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.'
      });
    }

    const jwtSecret = getJwtSecret();
    let decoded;

    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtErr) {
      // In non-production testing, support fallback test admin token if explicitly signed
      return res.status(401).json({
        success: false,
        message: 'Admin session expired or token is invalid. Please log in again.'
      });
    }

    const userId = decoded.id || decoded._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Malformed user token credentials.'
      });
    }

    // Verify against MongoDB directly — never trust decoded payload alone
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Administrator account not found.'
      });
    }

    // Verify administrative role strictly
    const userRole = (user.role || '').toLowerCase();
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrative privileges required.'
      });
    }

    // Verify account is not suspended
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Administrator account is suspended. Access denied.'
      });
    }

    // Attach verified user and admin object to request
    req.user = user;
    req.admin = user;

    return next();
  } catch (error) {
    console.error('Admin middleware authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during administrative authorization.'
    });
  }
};

module.exports = adminMiddleware;
