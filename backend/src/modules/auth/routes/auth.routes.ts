import { Router } from 'express';
import { validate } from '../../../middlewares/validate';

import { authController } from '../controllers/auth.controller';
import { registerSchema } from '../validation/auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);

export default router;
