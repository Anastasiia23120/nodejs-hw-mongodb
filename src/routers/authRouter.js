import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import validateBody from '../middlewares/validateBody.js';
import {
  registerSchema,
  loginSchema,
  resetEmailSchema,
  resetPasswordSchema,
} from '../schemas/authSchemas.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);

router.post('/logout', authenticate, authController.logout);

router.post(
  '/send-reset-email',
  validateBody(resetEmailSchema),
  authController.sendResetEmail,
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
