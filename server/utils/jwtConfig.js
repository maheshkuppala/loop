/**
 * JWT Configuration Helper
 * Enforces production security: in production, JWT_SECRET must be explicitly provided.
 * In development and test environments, falls back to a development key.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CRITICAL] JWT_SECRET environment variable is missing in production mode.');
      throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
    }
    return 'looop_jwt_dev_secret_key_2026';
  }
  return secret;
};

module.exports = {
  getJwtSecret
};
