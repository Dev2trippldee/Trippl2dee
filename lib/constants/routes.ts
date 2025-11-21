/**
 * Application routes
 * Centralizes all route paths to ensure consistency
 */

export const ROUTES = {
  // Public routes
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  VERIFY: "/verify",
  FORGOT_PASSWORD: "/forgot",
  RESET_PASSWORD: "/reset-password",
  VERIFY_PHONE: "/verifyphone",
  ADD_USERNAME: "/addusername",

  // Protected routes
  HOME: "/home",
  BRANCH_REG: "/branch-registration",
  POST_DETAIL: "/post/[alias]",
  RECIPE_DETAIL: "/recipe/[alias]",

  // API routes
  API: {
    COOKIES_GET_USER_DATA: "/api/cookies/get-user-data",
    USER_RESET_PASSWORD: "/api/user/reset-password",
  },
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.VERIFY,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
] as const;




