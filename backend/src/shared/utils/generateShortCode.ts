import crypto from "node:crypto";

export function generateShortCode(length = 6): string {
  return crypto
    .randomBytes(length)
    .toString("base64url")
    .slice(0, length);
}