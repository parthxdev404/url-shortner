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

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'LoggedIn Successfully',
      data: result,
    });
  });
}

export const authController = new AuthController();
