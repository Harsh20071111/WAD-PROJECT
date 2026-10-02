const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived access token (15 min default)
 */
const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Generate a long-lived refresh token (7 days default)
 */
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
