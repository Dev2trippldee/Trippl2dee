/**
 * Cookie names and configuration
 * Centralizes all cookie-related constants
 */

export const COOKIE_NAMES = {
  TOKEN: "token",
  EMAIL: "email",
  PHONE: "phone",
  REFERRAL_CODE: "referral_code",
  PHONE_VERIFIED: "phone_verified",
  TYPE: "type",
} as const;

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: false, // Set to true in production with HTTPS
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
} as const;

export const USER_COOKIE_CONFIG = {
  ...COOKIE_CONFIG,
  httpOnly: false, // User cookies can be accessed by client
} as const;

