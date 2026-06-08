const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived JWT access token.
 * @param {string} userId - MongoDB user ObjectId as string
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (userId) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

/**
 * Generate a long-lived JWT refresh token.
 * @param {string} userId - MongoDB user ObjectId as string
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Generate both access and refresh tokens in one call.
 * @param {string} userId - MongoDB user ObjectId as string
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokenPair };
