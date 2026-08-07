import { enqueResetPasswordEmail } from '../../../shared/queue/jobs/send-reset-password-email.job';
import { enqueueVerificationEmail } from '../../../shared/queue/jobs/send-verification-email.jobs';
import { ConflictError, UnauthorizedError } from '../../../shared/errors';
import { comparePassword, hashPassword } from '../../../shared/utils/password';
import { userRepository } from '../../users/repository/user.repository';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../../shared/utils/jwt';
import { deleteSession, getSession, saveSession } from '../../../shared/utils/session';
import { toUserResponse } from '../../users/utils/user-response';
import { env } from '../../../config/env';
import { generateOtp, hashOtp, compareOtp } from '../../../shared/utils/otp';
import { generateToken, hashToken } from '../../../shared/utils/token';
import { TOKEN_EXPIRY } from '../../../shared/constrants/token';

export class AuthService {
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

  async resendVerificationOtp(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

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

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmailWithPassword(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
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

  async me(userId: string) {
    const user = await userRepository.findProfileById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }

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

  async logOut(userId: string): Promise<void> {
    await deleteSession(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

    // Don't reveal whether the email exists.
    if (!user) {
      return;
    }

    const resetToken = generateToken();
    const hashedToken = hashToken(resetToken);

    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET);

    await userRepository.updatePasswordResetToken(user.id, hashedToken, expiresAt);

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await enqueResetPasswordEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const hashedToken = hashToken(token);

    const user = await userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw new UnauthorizedError('Invalid password reset link.');
    }

    if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
      throw new UnauthorizedError('Password reset link has expired.');
    }

    const passwordHash = await hashPassword(password);

    await userRepository.updatePassword(user.id, passwordHash);

    await userRepository.clearPasswordResetToken(user.id);

    await deleteSession(user.id);
  }
}

export const authService = new AuthService();
