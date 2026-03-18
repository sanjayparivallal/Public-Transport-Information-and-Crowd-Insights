const User = require('../models/User');
const Authority = require('../models/Authority');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

/**
 * Register a commuter.
 */
const registerCommuter = async ({ name, email, password, phone }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: 'commuter',
    phone: phone || undefined,
  });

  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);
  await _storeRefreshToken(user, refreshToken);

  return { accessToken, refreshToken, user: _safeUser(user) };
};

/**
 * Register an authority — creates a standalone Authority document.
 * Authorities are NOT stored in the users collection.
 */
const registerAuthority = async ({
  name,
  email,
  password,
  phone,
  organizationName,
  authorityCode,
  region,
  coveredDistricts,
  contactEmail,
  contactPhone,
  officeAddress,
}) => {
  const exists = await Authority.findOne({ email });
  if (exists) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const authority = await Authority.create({
    name,
    email,
    passwordHash: password,
    phone: phone || undefined,
    organizationName,
    authorityCode: authorityCode.toUpperCase(),
    region,
    coveredDistricts: coveredDistricts || [],
    contactEmail:  contactEmail  || email,
    contactPhone:  contactPhone  || phone || undefined,
    officeAddress: officeAddress || undefined,
  });

  const accessToken  = generateAccessToken(authority._id, 'authority');
  const refreshToken = generateRefreshToken(authority._id, 'authority');
  await _storeAuthorityRefreshToken(authority, refreshToken);

  return { accessToken, refreshToken, authority: _safeAuthority(authority) };
};

/**
 * Login — all roles.
 * Commuters/drivers/conductors are in the users collection.
 * Authorities are in the authorities collection.
 */
const login = async ({ email, password }) => {
  // Check users first (commuter / driver / conductor)
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash');
  if (user) {
    if (!user.isActive) {
      const err = new Error('Account is disabled');
      err.statusCode = 401;
      throw err;
    }
    const match = await user.comparePassword(password);
    if (!match) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    await _storeRefreshToken(user, refreshToken);
    return { accessToken, refreshToken, user: _safeUser(user) };
  }

  // Check authorities
  const authority = await Authority.findOne({ email }).select('+passwordHash +refreshTokenHash');
  if (authority) {
    if (!authority.isActive) {
      const err = new Error('Account is disabled');
      err.statusCode = 401;
      throw err;
    }
    const match = await authority.comparePassword(password);
    if (!match) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }
    const accessToken  = generateAccessToken(authority._id, 'authority');
    const refreshToken = generateRefreshToken(authority._id, 'authority');
    await _storeAuthorityRefreshToken(authority, refreshToken);
    return { accessToken, refreshToken, authority: _safeAuthority(authority) };
  }

  const err = new Error('Invalid credentials');
  err.statusCode = 401;
  throw err;
};

/**
 * Refresh — verifies the refresh token, checks it against the DB hash,
 * returns a new pair (rotation).  Role in token payload routes to correct collection.
 */
const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    const err = new Error('Refresh token is required');
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  if (decoded.role === 'authority') {
    const authority = await Authority.findById(decoded.id).select('+refreshTokenHash');
    if (!authority || !authority.isActive || !authority.refreshTokenHash) {
      const err = new Error('Refresh token revoked or authority not found');
      err.statusCode = 401;
      throw err;
    }
    const tokenMatch = await bcrypt.compare(incomingRefreshToken, authority.refreshTokenHash);
    if (!tokenMatch) {
      const err = new Error('Refresh token mismatch — please log in again');
      err.statusCode = 401;
      throw err;
    }
    const newAccessToken  = generateAccessToken(authority._id, 'authority');
    const newRefreshToken = generateRefreshToken(authority._id, 'authority');
    await _storeAuthorityRefreshToken(authority, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken, authority: _safeAuthority(authority) };
  }

  // User (commuter / driver / conductor)
  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || !user.isActive || !user.refreshTokenHash) {
    const err = new Error('Refresh token revoked or user not found');
    err.statusCode = 401;
    throw err;
  }
  const tokenMatch = await bcrypt.compare(incomingRefreshToken, user.refreshTokenHash);
  if (!tokenMatch) {
    const err = new Error('Refresh token mismatch — please log in again');
    err.statusCode = 401;
    throw err;
  }
  const newAccessToken  = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id, user.role);
  await _storeRefreshToken(user, newRefreshToken);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: _safeUser(user) };
};

/**
 * Logout — clears the stored refresh token hash.
 */
const logout = async (entityId, role) => {
  if (role === 'authority') {
    await Authority.findByIdAndUpdate(
      entityId,
      { $set: { refreshTokenHash: null } },
      { returnDocument: 'after' }
    );
  } else {
    await User.findByIdAndUpdate(
      entityId,
      { $set: { refreshTokenHash: null } },
      { returnDocument: 'after' }
    );
  }
};

// Hash and persist the refresh token on a user document
const _storeRefreshToken = async (user, rawToken) => {
  user.refreshTokenHash = await bcrypt.hash(rawToken, 10);
  await user.save({ validateBeforeSave: false });
};

// Hash and persist the refresh token on an authority document
const _storeAuthorityRefreshToken = async (authority, rawToken) => {
  authority.refreshTokenHash = await bcrypt.hash(rawToken, 10);
  await authority.save({ validateBeforeSave: false });
};

// Strip sensitive fields for user API responses
const _safeUser = (user) => ({
  id:       user._id,
  name:     user.name,
  email:    user.email,
  role:     user.role,
  phone:    user.phone,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// Strip sensitive fields for authority API responses
const _safeAuthority = (authority) => ({
  id:               authority._id,
  name:             authority.name,
  email:            authority.email,
  role:             'authority',
  phone:            authority.phone,
  organizationName: authority.organizationName,
  authorityCode:    authority.authorityCode,
  region:           authority.region,
  isActive:         authority.isActive,
  createdAt:        authority.createdAt,
});

module.exports = { registerCommuter, registerAuthority, login, refreshAccessToken, logout };
