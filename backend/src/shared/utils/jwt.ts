import jwt, { JwtPayload } from 'jsonwebtoken';

import { JWT_CONFIG } from '../../config/jwt';
import { UserRole } from '../../modules/users/model/user.model';

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: UserRole;
}

export function generateAccessToken(payload: Pick<TokenPayload, 'userId' | 'role'>): string {
  return jwt.sign(payload, JWT_CONFIG.access.secret, {
    expiresIn: JWT_CONFIG.access.expiresIn,
  });
}

export function generateRefreshToken(payload: Pick<TokenPayload, 'userId'>): string {
  return jwt.sign(payload, JWT_CONFIG.refresh.secret, {
    expiresIn: JWT_CONFIG.refresh.expiresIn,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_CONFIG.access.secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_CONFIG.refresh.secret) as TokenPayload;
}
