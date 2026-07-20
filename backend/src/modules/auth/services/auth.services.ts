import { ConflictError, UnauthorizedError } from '../../../shared/errors';
import { comparePassword, hashPassword } from '../../../shared/utils/password';

import { userRepository } from '../../users/repository/user.repository';
import { UserDocument } from '../../users/model/user.model';
import { generateAccessToken, generateRefreshToken } from '../../../shared/utils/jwt';
import { deleteSession, saveSession } from '../../../shared/utils/session';
import { getSession } from '../../../shared/utils/session';
import { verifyRefreshToken } from '../../../shared/utils/jwt';
import { toUserResponse } from '../../users/utils/user-response';

export class AuthService {
  async register(data: { name: string; email: string; password: string }): Promise<UserDocument> {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('Email Already Register');
    }

    const passwordHash = await hashPassword(data.password);

    return userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
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
