import { randomInt } from 'node:crypto';
import bcrypt from 'bcrypt';

const otpLength = 6;
const otpMin = 100000;
const otpMax = 1000000;

export const generateOtp = (): string => {
  return randomInt(otpMin, otpMax).toString().padStart(otpLength, '0');
};

export const hashOtp = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

export const compareOtp = (otp: string, hashedOtp: string): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOtp);
};
