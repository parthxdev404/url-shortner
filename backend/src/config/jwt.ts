import { SignOptions } from 'jsonwebtoken';

import { env } from './env';

export const JWT_CONFIG = {
  access: {
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRES as NonNullable<SignOptions['expiresIn']>,
  },

  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRES as NonNullable<SignOptions['expiresIn']>,
  },
} as const;
