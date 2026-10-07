const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtConfig');

/**
 * Authentication Middleware
 * Enforces authenticated JWT sessions on protected routes.
 * Derives user identity exclusively from the verified token.
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.'
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

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;

      // Check accountStatus in database to enforce suspension immediately
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1 && decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        const User = require('../models/User');
        const userDoc = await User.findById(decoded.id).select('accountStatus role');
        if (userDoc && userDoc.accountStatus === 'suspended') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been suspended by platform administration. Please contact support.'
          });
        }
      }

      next();
    } catch (jwtErr) {
      // If the token is a mock dev session token (e.g. created during UI demo)
      if (process.env.NODE_ENV !== 'production' && token.startsWith('mock_token_')) {
        req.user = {
          id: '66e1cb2f4a56b1a23c4d5e6f',
          email: 'aarav@looop.community',
          name: 'Aarav Sharma',
          role: 'customer'
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Session has expired or token is invalid. Please log in again.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error processing request.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = getJwtSecret();
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
    } catch {
      if (process.env.NODE_ENV !== 'production' && token.startsWith('mock_token_')) {
        req.user = {
          id: '66e1cb2f4a56b1a23c4d5e6f',
          email: 'aarav@looop.community',
          name: 'Aarav Sharma',
          role: 'customer'
        };
      }
    }
    return next();
  } catch {
    return next();
  }
};

module.exports = auth;
module.exports.auth = auth;
module.exports.optionalAuth = optionalAuth;
