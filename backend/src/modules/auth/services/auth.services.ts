import { ConflictError, UnauthorizedError } from '../../../shared/errors';
import { comparePassword, hashPassword } from '../../../shared/utils/password';

import { userRepository } from '../../users/repository/user.repository';
import { UserDocument } from '../../users/model/user.model';
import { generateAccessToken, generateRefreshToken } from '../../../shared/utils/jwt';
import { saveSession } from '../../../shared/utils/session';

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
    await saveSession(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
