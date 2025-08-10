import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import * as authController from '../controllers/authController.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(authController.register),
);
router.post(
  '/login',
  validateBody(loginSchema),
  ctrlWrapper(authController.login),
);
router.post('/refresh', ctrlWrapper(authController.refresh));
router.post('/logout', ctrlWrapper(authController.logout));

export default router;
