import { AppError, ConflictError, NotFoundError } from '../../../shared/errors';
import { comparePassword, hashPassword } from '../../../shared/utils/password';

import { userRepository } from '../../users/repository/user.repository';
import { UserDocument } from '../../users/model/user.model';

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

  async login(data: { email: string; password: string }): Promise<UserDocument> {
    const user = await userRepository.findByEmail(data.email);

    if (!user) throw new NotFoundError('User Not Found');

    const isMatch = await comparePassword(data.password, user.passwordHash);

    if (!isMatch) throw new AppError('Invalid Credentials');

    return user;
  }
}

export const authService = new AuthService();
