import { Router } from 'express';
import { validate } from '../../../middlewares/validate';

import { authController } from '../controllers/auth.controller';
import { loginSchema, refreshSchema, registerSchema } from '../validation/auth.validation';
import { authenticate } from '../../../middlewares/authenticate.middleware';
import { UserRole } from '../../users/model/user.model';
import { authorize } from '../../../middlewares/authorize';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refreshToken);
router.get('/me', authenticate, authController.me);
router.get('/admin', authenticate, authorize(UserRole.ADMIN), (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin',
  });
});
router.delete('/logout', authenticate, authController.logOut);

export default router;
