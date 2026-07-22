import { ConflictError, UnauthorizedError } from '../../../shared/errors';
import { comparePassword, hashPassword } from '../../../shared/utils/password';
import { userRepository } from '../../users/repository/user.repository';
import { UserDocument } from '../../users/model/user.model';
import { generateAccessToken, generateRefreshToken } from '../../../shared/utils/jwt';
import { deleteSession, saveSession } from '../../../shared/utils/session';
import { getSession } from '../../../shared/utils/session';
import { verifyRefreshToken } from '../../../shared/utils/jwt';
import { toUserResponse } from '../../users/utils/user-response';
import { env } from '../../../config/env';
import { emailService } from '../../../shared/email/email.service';
import { verifyEmailTemplate } from '../../../shared/email/templates/verify-email';
import { generateToken, hashToken } from '../../../shared/utils/token';
import { TOKEN_EXPIRY } from '../../../shared/constrants/token';

export class AuthService {
  async register(data: { name: string; email: string; password: string }): Promise<UserDocument> {
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

    const verificationToken = generateToken();

    const hashedToken = hashToken(verificationToken);

    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);

    await userRepository.updateVerificationToken(user.id, hashedToken, expiresAt);

    const verificationUrl = `${env.APP_URL}/verify-email?token=${verificationToken}`;

    const html = verifyEmailTemplate(user.name, verificationUrl);

    await emailService.send({
      to: user.email,
      subject: 'Verify your email',
      html,
    });

    return user;
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

    await userRepository.updateLastLogin(user.id);

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });
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

  async me(userId: string): Promise<UserDocument> {
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
}

export const authService = new AuthService();
