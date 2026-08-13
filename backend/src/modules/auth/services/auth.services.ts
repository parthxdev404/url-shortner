import { enqueResetPasswordEmail } from '../../../shared/queue/jobs/send-reset-password-email.job';
import { enqueueVerificationEmail } from '../../../shared/queue/jobs/send-verification-email.jobs';
import { logger } from '../../../config/logger';
import { ConflictError, UnauthorizedError } from '../../../shared/errors';

import { comparePassword, hashPassword } from '../../../shared/utils/password';

import { userRepository } from '../../users/repository/user.repository';
import { verifyGoogleToken } from './google-auth.service';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../../shared/utils/jwt';

import { deleteSession, getSession, saveSession } from '../../../shared/utils/session';

import { toUserResponse } from '../../users/utils/user-response';

import { generateOtp, hashOtp, compareOtp } from '../../../shared/utils/otp';

export class AuthService {
  // ─────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────

  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('Email already registered.');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    // Generate email verification OTP
    const otp = generateOtp();

    const hashedOtp = await hashOtp(otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userRepository.updateVerificationOtp(user.id, hashedOtp, expiresAt);

    await enqueueVerificationEmail({
      to: user.email,
      name: user.name,
      otp,
    });

    return toUserResponse(user);
  }

  // ─────────────────────────────────────────────
  // Verify Email
  // ─────────────────────────────────────────────

  async verifyEmail(email: string, otp: string): Promise<void> {
    const user = await userRepository.findByVerificationOtp(email);

    if (!user) {
      throw new UnauthorizedError('Invalid verification request.');
    }

    if (user.isVerified) {
      throw new UnauthorizedError('Email already verified.');
    }

    if (!user.verificationOtpExpiresAt || user.verificationOtpExpiresAt < new Date()) {
      throw new UnauthorizedError('Verification code has expired.');
    }

    if (!user.verificationOtp) {
      throw new UnauthorizedError('Verification code is invalid.');
    }

    const isOtpValid = await compareOtp(otp, user.verificationOtp);

    if (!isOtpValid) {
      throw new UnauthorizedError('Invalid verification code.');
    }

    await userRepository.verifyUser(user.id);
  }

  // ─────────────────────────────────────────────
  // Resend Verification OTP
  // ─────────────────────────────────────────────

  async resendVerificationOtp(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

    // Do not reveal whether account exists
    if (!user) {
      return;
    }

    if (user.isVerified) {
      throw new ConflictError('Email is already verified.');
    }

    const otp = generateOtp();

    const hashedOtp = await hashOtp(otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userRepository.updateVerificationOtp(user.id, hashedOtp, expiresAt);

    await enqueueVerificationEmail({
      to: user.email,
      name: user.name,
      otp,
    });
  }

  // ─────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmailWithPassword(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedError('Please verify your email before logging in.');
    }

    await userRepository.updateLastLogin(user.id);

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    await saveSession(user.id, {
      refreshToken,
      createdAt: new Date().toISOString(),
    });

    return {
      accessToken,
      refreshToken,
      user: toUserResponse(user),
    };
  }

  // ─────────────────────────────────────────────
  // Current User
  // ─────────────────────────────────────────────

  async me(userId: string) {
    const user = await userRepository.findProfileById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    return user;
  }

  // ─────────────────────────────────────────────
  // Refresh Token
  // ─────────────────────────────────────────────

  async refreshToken(refreshToken: string) {
    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    const session = await getSession(payload.userId);

    if (!session) {
      throw new UnauthorizedError('Session expired.');
    }

    if (session.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Refresh token mismatch.');
    }

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
    });

    await saveSession(user.id, {
      refreshToken: newRefreshToken,
      createdAt: new Date().toISOString(),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────

  async logOut(userId: string): Promise<void> {
    await deleteSession(userId);
  }

  // ─────────────────────────────────────────────
  // Forgot Password
  // ─────────────────────────────────────────────

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

    // Never reveal whether an email exists.
    if (!user) {
      return;
    }

    const otp = generateOtp();

    const hashedOtp = await hashOtp(otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userRepository.updatePasswordResetOtp(user.id, hashedOtp, expiresAt);

    await enqueResetPasswordEmail({
      to: user.email,
      name: user.name,
      otp,
    });
  }

  // ─────────────────────────────────────────────
  // Reset Password
  // ─────────────────────────────────────────────

  async resetPassword(email: string, otp: string, password: string): Promise<void> {
    const user = await userRepository.findByPasswordResetOtp(email);

    if (!user) {
      throw new UnauthorizedError('Invalid password reset request.');
    }

    if (!user.passwordResetOtpExpiresAt || user.passwordResetOtpExpiresAt < new Date()) {
      throw new UnauthorizedError('Password reset code has expired.');
    }

    if (!user.passwordResetOtp) {
      throw new UnauthorizedError('Password reset code is invalid.');
    }

    const isOtpValid = await compareOtp(otp, user.passwordResetOtp);

    if (!isOtpValid) {
      throw new UnauthorizedError('Invalid password reset code.');
    }

    const passwordHash = await hashPassword(password);

    await userRepository.updatePassword(user.id, passwordHash);

    // Make OTP unusable immediately.
    await userRepository.clearPasswordResetOtp(user.id);

    // Invalidate existing sessions.
    try {
      await deleteSession(user.id);
    } catch (error) {
      logger.error(
        {
          error,
          userId: user.id,
        },
        'Failed to invalidate sessions after password reset',
      );
    }
  }

  // Google login

  async googleLogin(token: string) {
    const googleUser = await verifyGoogleToken(token);

    const { googleId, name, email } = googleUser;

    let user = await userRepository.findByEmail(email);
    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        throw new UnauthorizedError('This email is already linked to another Google account.');
      }

      if (!user.googleId) {
        const updatedUser = await userRepository.updateGoogleId(user.id, googleId);

        if (!updatedUser) {
          throw new UnauthorizedError('Unable to link Google account.');
        }

        user = updatedUser;
      }
    }

    if (!user) {
      user = await userRepository.create({
        name,
        email,
        googleId,
      });
    }

    await userRepository.updateLastLogin(user.id);

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    await saveSession(user.id, {
      refreshToken,
      createdAt: new Date().toISOString(),
    });

    return {
      accessToken,
      refreshToken,
      user: toUserResponse(user),
    };
  }
}

export const authService = new AuthService();
