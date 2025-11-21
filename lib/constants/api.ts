/**
 * API endpoints
 * Centralizes all API endpoint paths
 */

import { env } from "../config/env";

const API_BASE = env.apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    VALIDATE_OTP: `${API_BASE}/auth/validate-otp`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
  },
  USER: {
    SET_USERNAME: `${API_BASE}/user/set-user-name`,
    RESET_PASSWORD: `${API_BASE}/user/reset-password`,
    LOGOUT: `${API_BASE}/user/logout`,
  },
  CHECK: {
    EMAIL: `${API_BASE}/check-email`,
    PHONE_NUMBER: `${API_BASE}/check-phone-number`,
    USER_IDENTIFIER: `${API_BASE}/check-user-identifier`,
  },
  POST: {
    CREATE_OR_UPDATE: `${API_BASE}/post/create-or-update`,
    GET_ALL: `${API_BASE}/post/get-all-posts`,
    DELETE: `${API_BASE}/post/delete/post`,
    TOGGLE_LIKE: `${API_BASE}/post/toggle-like`,
    GET_LIKES_COUNT: `${API_BASE}/post/get-likes-count`,
    SHARE: `${API_BASE}/post/share`,
    TOGGLE_SAVE: `${API_BASE}/post/toggle-save`,
    GET_SAVED_POSTS: `${API_BASE}/post/get/saved-posts`,
    REPORT: `${API_BASE}/post/report`,
    CREATE_COMMENT: `${API_BASE}/post/create-or-update/comment`,
    GET_COMMENTS: `${API_BASE}/post/get-comment`,
    DELETE_COMMENT: `${API_BASE}/post/delete/comment`,
    TOGGLE_HIDE: `${API_BASE}/post/toggle-hide`,
  },
  PRIVACY: {
    LIST: `${API_BASE}/post-receipe/privacy`,
  },
  RECIPE: {
    CREATE_OR_UPDATE: `${API_BASE}/recipe/create-or-update`,
    GET_ALL: `${API_BASE}/recipe/get-all-recipes`,
    GET_SET: `${API_BASE}/recipe/get-set-of-recipes`,
    DELETE: `${API_BASE}/recipe/delete/recipe`,
    GET_CUISINES: `${API_BASE}/get-cuisines`,
    GET_FOOD_CATEGORIES: `${API_BASE}/get-food-categories`,
    GET_RECIPE_CATEGORIES: `${API_BASE}/recipe/recipe-categories`,
    GET_FOOD_TYPES: `${API_BASE}/recipe/recipe-food-types`,
    REPORT: `${API_BASE}/recipe/report`,
    TOGGLE_SAVE: `${API_BASE}/recipe/toggle-save`,
    TOGGLE_LIKE: `${API_BASE}/recipe/toggle-like`,
    GET_LIKES_COUNT: `${API_BASE}/recipe/get-likes-count`,
    SHARE: `${API_BASE}/recipe/share`,
    TOGGLE_HIDE: `${API_BASE}/recipe/toggle-hide`,
    CREATE_OR_UPDATE_REVIEW: `${API_BASE}/recipe/create-or-update/review`,
    GET_REVIEW: `${API_BASE}/recipe/get-review`,
    DELETE_REVIEW: `${API_BASE}/recipe/delete/review`,
  },
  EATERY: {
    CREATE_OR_UPDATE: `${API_BASE}/eatery/create-or-update`,
    VALIDATE_OTP: `${API_BASE}/eatery/validate-otp`,
    GET_AMENITIES: `${API_BASE}/get-amenities`,
    GET_WORKING_DAYS: `${API_BASE}/get-working-days`,
  },
  ACCOUNT: {
    GET_ORG_TYPES: `${API_BASE}/account-org-types`,
  },
} as const;

