"use server";

/**
 * Cookie management server actions
 * Handles all cookie-related operations
 */

import { cookies } from "next/headers";
import {
  COOKIE_NAMES,
  COOKIE_CONFIG,
  USER_COOKIE_CONFIG,
} from "@/lib/constants/cookies";

/**
 * Set authentication token cookie
 */
export async function setTokenCookie(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.TOKEN, token, {
    ...COOKIE_CONFIG,
  });
  return true;
}

/**
 * Get authentication token cookie
 */
export async function getTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.TOKEN)?.value;
}

/**
 * Set authentication cookies (token + phone verification status)
 */
export async function setAuthCookies(
  token: string,
  isPhoneNumberVerified: boolean
): Promise<boolean> {
  const cookieStore = await cookies();

  // Set token
  cookieStore.set(COOKIE_NAMES.TOKEN, token, {
    ...COOKIE_CONFIG,
  });

  // Set phone verification status
  cookieStore.set(COOKIE_NAMES.PHONE_VERIFIED, String(isPhoneNumberVerified), {
    ...USER_COOKIE_CONFIG,
  });

  return true;
}

/**
 * Get phone verification status
 */
export async function getPhoneVerifiedCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAMES.PHONE_VERIFIED)?.value;
  return value === "true";
}

/**
 * Set user cookies (email, phone, referral_code)
 * All three values are required
 */
export async function setUserCookies(
  email: string,
  phone: string,
  referralCode: string
): Promise<boolean> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.EMAIL, email, {
    ...USER_COOKIE_CONFIG,
  });

  cookieStore.set(COOKIE_NAMES.PHONE, phone, {
    ...USER_COOKIE_CONFIG,
  });

  cookieStore.set(COOKIE_NAMES.REFERRAL_CODE, referralCode, {
    ...USER_COOKIE_CONFIG,
  });

  return true;
}

/**
 * Set user cookies optionally (only sets values that are provided)
 */
export async function setUserCookiesOptional(
  email: string | null,
  phone: string | null,
  referralCode: string | null,
  type: string | null = null
): Promise<boolean> {
  const cookieStore = await cookies();

  if (email) {
    cookieStore.set(COOKIE_NAMES.EMAIL, email, {
      ...USER_COOKIE_CONFIG,
    });
  }

  if (phone) {
    cookieStore.set(COOKIE_NAMES.PHONE, phone, {
      ...USER_COOKIE_CONFIG,
    });
  }

  if (referralCode) {
    cookieStore.set(COOKIE_NAMES.REFERRAL_CODE, referralCode, {
      ...USER_COOKIE_CONFIG,
    });
  }

  if (type) {
    cookieStore.set(COOKIE_NAMES.TYPE, type, {
      ...USER_COOKIE_CONFIG,
    });
  }

  return true;
}

/**
 * Get individual user cookie
 */
export async function getUserCookie(
  name: "email" | "phone" | "referral_code"
): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieName = COOKIE_NAMES[name.toUpperCase() as keyof typeof COOKIE_NAMES];
  return cookieStore.get(cookieName)?.value;
}

/**
 * Delete token cookie
 */
export async function deleteTokenCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.TOKEN);
  return true;
}

/**
 * Delete all user cookies (logout)
 */
export async function deleteAllUserCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.TOKEN);
  cookieStore.delete(COOKIE_NAMES.EMAIL);
  cookieStore.delete(COOKIE_NAMES.PHONE);
  cookieStore.delete(COOKIE_NAMES.REFERRAL_CODE);
  cookieStore.delete(COOKIE_NAMES.PHONE_VERIFIED);
  cookieStore.delete(COOKIE_NAMES.TYPE);
  return true;
}

/**
 * Legacy alias for backward compatibility
 */
export async function getCookie(): Promise<string | undefined> {
  return getTokenCookie();
}

export async function setCookie(token: string): Promise<boolean> {
  return setTokenCookie(token);
}




