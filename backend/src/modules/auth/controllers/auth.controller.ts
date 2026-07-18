import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncHandler } from '../../../middlewares/async-handler';
import { authService } from '../services/auth.services';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  });
}

export const authController = new AuthController();
