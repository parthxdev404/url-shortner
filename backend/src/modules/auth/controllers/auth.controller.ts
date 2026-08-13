import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncHandler } from '../../../middlewares/async-handler';
import { authService } from '../services/auth.services';
import { toUserResponse } from '../../users/utils/user-response';
import { UnauthorizedError } from '../../../shared/errors';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User created successfully. Please verify your email.',
      data: user,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    await authService.verifyEmail(email, otp);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Email verified successfully.',
    });
  });

  resendVerificationOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.resendVerificationOtp(email);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'If the account exists and is not verified, a verification code has been sent.',
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logged in successfully.',
      data: result,
    });
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: toUserResponse(user),
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: result,
    });
  });

  logOut = asyncHandler(async (req: Request, res: Response) => {
    await authService.logOut(req.user!.id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logged out successfully.',
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'If an account with that email exists, a password reset code has been sent.',
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;

    await authService.resetPassword(email, otp, password);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset successfully.',
    });
  });

  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body as {
      token?: string;
    };

    if (!token) {
      throw new UnauthorizedError('Google Token is required');
    }

    const result = await authService.googleLogin(token);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Google Login Successfull',
      data: result,
    });
  });
}

export const authController = new AuthController();
