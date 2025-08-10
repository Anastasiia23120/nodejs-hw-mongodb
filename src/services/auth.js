import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/User.js';
import Session from '../models/Session.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET_ACCESS;
const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET_REFRESH;

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashedPassword });
  return user;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError(401, 'Invalid email or password');

  await Session.deleteMany({ userId: user._id });

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });

  const now = new Date();

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now.getTime() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session._id.toString(),
  };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) throw createError(401, 'No refresh token');

  const session = await Session.findOne({ refreshToken });
  if (!session) throw createError(401, 'Invalid refresh token');

  const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

  await Session.deleteMany({ userId: payload.userId });

  const accessToken = jwt.sign(
    { userId: payload.userId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' },
  );
  const newRefreshToken = jwt.sign(
    { userId: payload.userId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' },
  );

  const now = new Date();
  await Session.create({
    userId: payload.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(now.getTime() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, newRefreshToken };
};

export const logout = async (refreshToken) => {
  await Session.deleteOne({ refreshToken });
};
