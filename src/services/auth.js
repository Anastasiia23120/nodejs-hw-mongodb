import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { sendEmail } from './email.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET_ACCESS;
const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET_REFRESH;
const RESET_TOKEN_SECRET = process.env.JWT_SECRET_RESET;

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createError(409, 'Email already in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  return user;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid credentials');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw createError(401, 'Invalid credentials');

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken };
};

export const refresh = async (token) => {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const session = await Session.findOne({
      userId: payload.userId,
      refreshToken: token,
    });
    if (!session) throw createError(401, 'Invalid refresh token');

    const accessToken = jwt.sign(
      { userId: payload.userId },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: '15m',
      },
    );
    const refreshToken = jwt.sign(
      { userId: payload.userId },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: '30d',
      },
    );

    const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
    const refreshTokenValidUntil = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    );

    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
    session.accessTokenValidUntil = accessTokenValidUntil;
    session.refreshTokenValidUntil = refreshTokenValidUntil;

    await session.save();

    return { accessToken, refreshToken };
  } catch (err) {
    console.error(err);
    throw createError(401, 'Invalid refresh token');
  }
};

export const logout = async (
  refreshToken,
  allDevices = false,
  userId = null,
) => {
  if (allDevices && userId) {
    await Session.deleteMany({ userId });
  } else if (refreshToken) {
    await Session.findOneAndDelete({ refreshToken });
  }
};

export const sendResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(404, 'User not found');

  const resetToken = jwt.sign({ userId: user._id }, RESET_TOKEN_SECRET, {
    expiresIn: '5m',
  });
  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: `Click here to reset: ${resetLink}`,
  });
};

export const resetPassword = async (token, password) => {
  try {
    const payload = jwt.verify(token, RESET_TOKEN_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) throw createError(404, 'User not found!');

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await Session.deleteMany({ userId: user._id });
  } catch (err) {
    console.error(err);
    throw createError(401, 'Token is expired or invalid.');
  }
};
