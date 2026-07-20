import { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../shared/utils/jwt';
import { UnauthorizedError } from '../shared/errors';
import { userRepository } from '../modules/users/repository/user.repository';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication required.');
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Authentication Required');
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired token.');
  }

  const user = await userRepository.findById(payload.userId);

  if (!user) {
    throw new UnauthorizedError('User not found.');
  }

  req.user = {
    id: user.id,
    role: user.role,
  };

  next();
}
