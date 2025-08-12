import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/User.js';
import Session from '../models/Session.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET_ACCESS;

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) throw createError(401, 'No token provided');

    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      throw createError(401, 'Session not found or logged out');
    }

    const user = await User.findById(payload.userId);
    if (!user) throw createError(401, 'User not found');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, 'Access token expired'));
    }
    next(createError(401, 'Invalid token'));
  }
};
