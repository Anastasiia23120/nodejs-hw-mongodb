import * as authService from '../services/auth.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const tokens = await authService.login(req.body);
    res.json({
      status: 200,
      message: 'Successfully logged in!',
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.json({
      status: 200,
      message: 'Tokens refreshed successfully!',
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.sendResetEmail(email);
    res.json({
      status: 200,
      message: 'Reset password email sent successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json({
      status: 200,
      message: 'Password has been reset successfully!',
    });
  } catch (err) {
    next(err);
  }
};
