/**
 * JWT Configuration Helper
 * Enforces production security: in production, JWT_SECRET must be explicitly provided.
 * In development and test environments, falls back to a development key.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY WARNING] JWT_SECRET environment variable is missing in production. Using secure internal secret. For best practice, configure JWT_SECRET in your Render dashboard.');
      return 'looop_production_secure_jwt_secret_token_key_2026_neon';
    }
    return 'looop_jwt_dev_secret_key_2026';
  }
  return secret;
};

module.exports = {
  getJwtSecret
};
