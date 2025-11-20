"use server";

/**
 * Authentication server actions
 * Handles all authentication-related operations
 */

import { cookies } from "next/headers";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { handleApiError } from "@/lib/api/client";
import { setUserCookiesOptional, setTokenCookie, deleteAllUserCookies } from "../cookies";
import type {
  SignUpInputs,
  SignInInputs,
  ApiResponse,
  AuthResponse,
} from "@/types/auth";

/**
 * Check email availability
 */
export async function checkEmailAvailability(
  email: string
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await axios.get(API_ENDPOINTS.CHECK.EMAIL, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      data: { email },
    });

    return {
      success: response.data?.success || false,
      message: response.data?.message || "",
      data: { available: response.data?.success || false },
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;

    if (error.response?.data?.success === false) {
      return {
        success: false,
        message: error.response?.data?.message || "Email is already taken",
        data: { available: false },
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Failed to check email",
      data: { available: false },
    };
  }
}

/**
 * Check phone number availability
 */
export async function checkPhoneAvailability(
  phoneNumber: string
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await axios.get(API_ENDPOINTS.CHECK.PHONE_NUMBER, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      data: { phone_number: phoneNumber },
    });

    return {
      success: response.data?.success || false,
      message: response.data?.message || "",
      data: { available: response.data?.success || false },
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;

    if (error.response?.data?.success === false) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Phone number is already taken",
        data: { available: false },
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Failed to check phone number",
      data: { available: false },
    };
  }
}

/**
 * Check username availability
 */
export async function checkUsernameAvailability(
  username: string
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await axios.get(API_ENDPOINTS.CHECK.USER_IDENTIFIER, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      data: { user_identifier: username },
    });

    return {
      success: response.data?.success || false,
      message: response.data?.message || "",
      data: { available: response.data?.success || false },
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;

    if (error.response?.data?.success === false) {
      return {
        success: false,
        message: error.response?.data?.message || "Username is already taken",
        data: { available: false },
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Failed to check username",
      data: { available: false },
    };
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  formData: SignUpInputs
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, formData);

    if (response.data?.success && response.data?.data) {
      const { access_token, user } = response.data.data;

      if (access_token) {
        await setTokenCookie(access_token);
      }

      if (user) {
        const fullPhone =
          user?.country_code && user?.phone_number
            ? `${user.country_code}${user.phone_number}`
            : null;

        // Extract type from account_details
        const accountType = (user as any)?.account_details?.type || null;

        await setUserCookiesOptional(
          user.email || null,
          fullPhone,
          user.referral_code || null,
          accountType
        );
      }
    }

    return { success: true, data: response.data };
  } catch (err) {
    return handleApiError<AuthResponse>(err);
  }
}

/**
 * Login user
 */
export async function loginUser(
  formData: SignInInputs
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);

    if (response.data?.success && response.data?.data) {
      const { access_token, user } = response.data.data;

      if (access_token) {
        await setTokenCookie(access_token);
      }

      if (user) {
        const fullPhone =
          user?.country_code && user?.phone_number
            ? `${user.country_code}${user.phone_number}`
            : null;

        // Extract type from account_details
        const accountType = (user as any)?.account_details?.type || null;

        await setUserCookiesOptional(
          user.email || null,
          fullPhone,
          user.referral_code || null,
          accountType
        );
      }
    }

    return { 
      success: true, 
      message: response.data?.message,
      data: response.data?.data 
    };
  } catch (err) {
    return handleApiError<AuthResponse>(err);
  }
}

/**
 * Set username
 */
export async function setUsername(
  username: string
): Promise<ApiResponse<{ user_identifier: string }>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication token not found",
      };
    }

    const response = await axios.patch(
      API_ENDPOINTS.USER.SET_USERNAME,
      { user_name: username },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: "Username set successfully",
    };
  } catch (err) {
    return handleApiError<{ user_identifier: string }>(err);
  }
}

/**
 * Send password reset link
 */
export async function sendPasswordResetLink(
  email: string
): Promise<ApiResponse> {
  try {
    const response = await axios.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Reset link sent successfully",
      data: response.data?.data || null,
    };
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * Reset password
 */
export async function resetPassword(formData: {
  password: string;
  password_confirmation: string;
  token: string;
  email: string;
}): Promise<ApiResponse> {
  try {
    const response = await axios.post(
      API_ENDPOINTS.USER.RESET_PASSWORD,
      {
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        token: formData.token,
        email: formData.email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Password reset successfully",
      data: response.data?.data || null,
    };
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  formData: Record<string, unknown>
): Promise<ApiResponse> {
  try {
    const res = await axios.post(API_ENDPOINTS.AUTH.VALIDATE_OTP, formData);
    return {
      success: true,
      data: res.data,
      message: res.data?.message || "OTP verified successfully",
    };
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * Logout user
 * Removes all authentication and user-related cookies
 */
export async function logoutUser(): Promise<ApiResponse> {
  try {
    await deleteAllUserCookies();
    return { success: true, message: "Logged out successfully" };
  } catch (err) {
    console.error("Logout error:", err);
    return {
      success: false,
      message: "Logout failed",
    };
  }
}

