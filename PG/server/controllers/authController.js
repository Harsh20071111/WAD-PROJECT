const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// ─── helpers ──────────────────────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const safeUser = (user) => ({
  _id:      user._id,
  name:     user.name,
  email:    user.email,
  phone:    user.phone,
  role:     user.role,
  pgId:     user.pgId,
  isActive: user.isActive,
});

// ─── @POST /api/auth/register ─────────────────────────────────────────────────
// Only ADMIN can self-register (the first admin bootstraps from the seed).
// Residents and staff are created by an admin in later phases.
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required.');
  }

  // Only allow ADMIN self-registration here; residents/staff go through admin flow
  const allowedSelfRoles = ['ADMIN'];
  const userRole = role && allowedSelfRoles.includes(role.toUpperCase())
    ? role.toUpperCase()
    : 'ADMIN';

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const user = await User.create({
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    phone:        phone?.trim() || '',
    passwordHash: password,   // pre-save hook bcrypts this
    role:         userRole,
    isActive:     true,
  });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Persist hashed refresh token on the user doc
  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      accessToken,
      refreshToken,
      user: safeUser(user),
    },
  });
});

// ─── @POST /api/auth/login ────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  // Explicitly select passwordHash (hidden by default via select:false)
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+passwordHash +refreshToken');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact admin.');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token on user doc (hashed storage is fine for this scale)
  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      accessToken,
      refreshToken,
      user: safeUser(user),
    },
  });
});

// ─── @POST /api/auth/refresh ──────────────────────────────────────────────────
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token is required.');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error('Invalid or expired refresh token. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    res.status(401);
    throw new Error('Refresh token mismatch. Please log in again.');
  }

  const newAccessToken  = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: 'Token refreshed.',
    data: {
      accessToken:  newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
});

// ─── @POST /api/auth/logout ───────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Invalidate the stored refresh token
    await User.findOneAndUpdate(
      { refreshToken },
      { $set: { refreshToken: null } }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
    data: null,
  });
});

// ─── @GET /api/auth/me  (protected) ──────────────────────────────────────────
const me = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({
    success: true,
    message: 'User profile fetched.',
    data: { user: safeUser(req.user) },
  });
});

module.exports = { register, login, refresh, logout, me };
