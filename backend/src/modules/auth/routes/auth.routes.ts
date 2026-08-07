import { Router } from 'express';
import { validate } from '../../../middlewares/validate';

import { authController } from '../controllers/auth.controller';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  verifyEmailSchema,
  resendVerificationOtpSchema,
} from '../validation/auth.validation';

import { authenticate } from '../../../middlewares/authenticate.middleware';
import { UserRole } from '../../users/model/user.model';
import { authorize } from '../../../middlewares/authorize';

import { forgotPasswordSchema } from '../validation/forgot-password-schema';
import { resetPasswordSchema } from '../validation/reset-password-schema';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);

router.post('/refresh', validate(refreshSchema), authController.refreshToken);

router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

router.post(
  '/resend-verification-otp',
  validate(resendVerificationOtpSchema),
  authController.resendVerificationOtp,
);

router.get('/me', authenticate, authController.me);

router.post('/logout', authenticate, authController.logOut);

router.get('/admin', authenticate, authorize(UserRole.ADMIN), (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin',
  });
});

export default router;
