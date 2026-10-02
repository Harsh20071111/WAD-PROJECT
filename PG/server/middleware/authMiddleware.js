const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies Bearer access token and attaches req.user.
 * Selects out passwordHash and refreshToken so they never reach controllers.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Session expired — please log in again'
        : 'Not authorized — invalid token';

    return res.status(401).json({ success: false, message });
  }
};

module.exports = { protect };
