import { OAuth2Client } from 'google-auth-library';
import { env } from '../../../config/env';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export type GoogleUserPayload = {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
};

export const verifyGoogleToken = async (token: string): Promise<GoogleUserPayload> => {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error('Invalid Google token.');
  }

  if (!payload.sub) {
    throw new Error('Google account ID is missing.');
  }

  if (!payload.email) {
    throw new Error('Google account email is missing.');
  }

  if (payload.email_verified !== true) {
    throw new Error('Google email is not verified.');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? 'Google User',
    picture: payload.picture ?? null,
  };
};
