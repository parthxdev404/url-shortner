import { Router } from 'express';
import { validate } from '../../../middlewares/validate';

import { authController } from '../controllers/auth.controller';
import { loginSchema, registerSchema } from '../validation/auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
