import { Router } from 'express';
import { validate } from '../../../middlewares/validate';

import { authController } from '../controllers/auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendVerificationOtpSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validation/auth.validation';

import { authenticate } from '../../../middlewares/authenticate.middleware';
import { UserRole } from '../../users/model/user.model';
import { authorize } from '../../../middlewares/authorize';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);

router.post('/refresh', validate(refreshSchema), authController.refreshToken);

router.post('/logout', authenticate, authController.logOut);

router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

router.post(
  '/resend-verification-otp',
  validate(resendVerificationOtpSchema),
  authController.resendVerificationOtp,
);

router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.get('/me', authenticate, authController.me);

router.get('/admin', authenticate, authorize(UserRole.ADMIN), (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin',
  });
});

export default router;
