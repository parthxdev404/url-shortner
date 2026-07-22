import { cleanEnv, email, port, str } from 'envalid';
import 'dotenv/config';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'production', 'test'],
    default: 'development',
  }),

  PORT: port({
    default: 5000,
  }),

  CLIENT_URL: str(),

  MONGO_URI: str(),

  REDIS_URL: str(),

  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_ACCESS_EXPIRES: str(),
  JWT_REFRESH_EXPIRES: str(),

  RESEND_API_KEY: str(),
  EMAIL_FROM: email(),
  APP_URL: str(),

  LOG_LEVEL: str({
    default: 'info',
  }),
});
