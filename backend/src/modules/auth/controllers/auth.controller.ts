import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { env } from '../../../config/env';
import { asyncHandler } from '../../../middlewares/async-handler';
import { authService } from '../services/auth.services';
import { toUserResponse } from '../../users/utils/user-response';

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

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: toUserResponse(user),
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: result,
    });
  });

  logOut = asyncHandler(async (req: Request, res: Response) => {
    await authService.logOut(req.user!.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logged Out Successfully',
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    await authService.verifyEmail(token);

    res.redirect(`${env.CLIENT_URL}/login?verified=true`);
  });
}

export const authController = new AuthController();
