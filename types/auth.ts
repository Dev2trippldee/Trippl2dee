/**
 * Authentication-related types
 */

import { z } from "zod";

/**
 * Sign-up form schema and types
 */
export const signUpSchema = z
  .object({
    name: z.string().min(3, "Name should be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    account_type_alias: z.string().min(1, "Please select a user type"),
    phone_number: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })
  .refine((data) => {
    const phone = data.phone_number;
    if (!phone || phone.trim().length === 0) {
      return true;
    }
    if (phone.trim().length <= 4) {
      return true;
    }
    return phone.length >= 13;
  }, {
    message: "Enter full phone number with country code",
    path: ["phone_number"],
  });

export type SignUpInputs = z.infer<typeof signUpSchema>;

/**
 * Sign-in form schema and types
 */
export const signInSchema = z.object({
  login: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInInputs = z.infer<typeof signInSchema>;

/**
 * Username form schema and types
 */
export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export type UsernameInputs = z.infer<typeof usernameSchema>;

/**
 * Reset password form schema and types
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
    token: z.string().min(1, "Token is required"),
    email: z.string().email("Invalid email address"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

/**
 * API response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export interface AuthResponse {
  access_token: string;
  user: {
    email?: string;
    phone_number?: string;
    country_code?: string;
    referral_code?: string;
    phone_number_verified?: boolean;
    user_identifier?: string;
  };
  is_first_login?: boolean;
}

export interface UserData {
  email: string | null;
  phone: string | null;
  referralCode: string | null;
  phoneVerified?: string | null;
  token?: string | null;
}




