"use server";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import type { Inputs } from "@/app/(auth)/components/signupForm";
import type { Inputs as InputsSignIn } from "@/app/(auth)/components/signinForm";
import { setUserCookiesOptional } from "./cookies";

// Helper function to set user cookies
async function setUserCookies(email: string, phone: string, referralCode: string) {
  const cookieStore = await cookies();

  cookieStore.set("email", email, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  cookieStore.set("phone", phone, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  cookieStore.set("referral_code", referralCode, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

// Helper function to set token cookie
async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

// NEW: Check email availability
export async function checkEmailAvailability(email: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/check-email`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        data: {
          email: email,
        },
      }
    );

    return {
      success: response.data?.success || false,
      message: response.data?.message || "",
      available: response.data?.success || false,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;
    
    // If success is false, email is not available
    if (error.response?.data?.success === false) {
      return {
        success: false,
        message: error.response?.data?.message || "Email is already taken",
        available: false,
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Failed to check email",
      available: false,
    };
  }
}

// NEW: Check phone number availability
export async function checkPhoneAvailability(phoneNumber: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/check-phone-number`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        data: {
          phone_number: phoneNumber,
        },
      }
    );

    return {
      success: response.data?.success || false,
      message: response.data?.message || "",
      available: response.data?.success || false,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;
    
    // If success is false, phone number is not available
    if (error.response?.data?.success === false) {
      return {
        success: false,
        message: error.response?.data?.message || "Phone number is already taken",
        available: false,
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Failed to check phone number",
      available: false,
    };
  }
}

// NEW: Check username availability
export async function checkUsernameAvailability(username: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/check-user-identifier`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        data: {
          user_identifier: username,
        },
      }
    );

    return {
      success: response.data?.success || false,
      message: response.data?.message || "",
      available: response.data?.success || false,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;
    
    // If success is false, username is not available
    if (error.response?.data?.success === false) {
      return {
        success: false,
        message: error.response?.data?.message || "Username is already taken",
        available: false,
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Failed to check username",
      available: false,
    };
  }
}

export async function registerUser(formData: Inputs) {
  console.log("REGISTER USER", "formdata", formData);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      formData,
    );
    console.log("Success response:", response.data);

    if (response.data?.success && response.data?.data) {
      const { access_token, user } = response.data.data;

      if (access_token) {
        await setTokenCookie(access_token);
      }

      // Store user cookies if any data is available
      if (user) {
        const fullPhone =
          user?.country_code && user?.phone_number
            ? `${user.country_code}${user.phone_number}`
            : null;

        // Store cookies individually - each one is optional
        await setUserCookiesOptional(
          user.email || null,
          fullPhone,
          user.referral_code || null
        );
      }
    }

    return { success: true, data: response.data };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; errors?: unknown }>;

    console.log(error.response?.data);

    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
      errors: error.response?.data?.errors || null,
    };
  }
}


export async function setUsername(username: string) {
  console.log("SET USERNAME");

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
      `${process.env.NEXT_PUBLIC_API_URL}/user/set-user-name`,
      { user_name: username },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Username set successfully:", response.data);
    return {
      success: true,
      data: response.data,
      username: response.data?.data?.user_identifier,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; errors?: unknown }>;

    console.log("Set username error:", error.response?.data);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to set username",
      errors: error.response?.data?.errors || null,
    };
  }
}

// Add this function to your existing auth.ts file

export async function sendPasswordResetLink(email: string) {
  console.log("SEND PASSWORD RESET LINK", "email", email);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Password reset response:", response.data);

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Reset link sent successfully",
      data: response.data?.data || null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;

    console.log("Forgot password error:", error.response?.data);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to send reset link",
    };
  }
}

export async function resetPassword(formData: {
  password: string;
  password_confirmation: string;
  token: string;
  email: string;
}) {
  console.log("RESET PASSWORD", "formData", { ...formData, password: "***", password_confirmation: "***" });

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/user/reset-password`,
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

    console.log("Reset password response:", response.data);

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Password reset successfully",
      data: response.data?.data || null,
    };
  } catch (err) {
    const error = err as AxiosError<{ message?: string; success?: boolean }>;

    console.log("Reset password error:", error.response?.data);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to reset password",
    };
  }
}

export async function loginUser(formData: InputsSignIn) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      formData,
    );
    console.log("Success response:", response.data);

    // Store token and user data in cookies on successful login
    if (response.data?.success && response.data?.data) {
      const { access_token, user } = response.data.data;

      if (access_token) {
        await setTokenCookie(access_token);
      }

      // Store user cookies if any data is available
      if (user) {
        const fullPhone =
          user?.country_code && user?.phone_number
            ? `${user.country_code}${user.phone_number}`
            : null;

        // Extract type from account_details
        const accountType = (user as any)?.account_details?.type || null;

        // Store cookies individually - each one is optional
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
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
        errors: err.response?.data?.errors || null,
      };
    } else {
      console.error("Unknown error:", err);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  }
}

// export async function verifyOTP(formData: Record<string, unknown>) {
//   console.log(formData);
//   try {
//     const res = await axios.post(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/validate-otp`,
//       formData
//     );
//     console.log(res);
//     return { success: true, data: res.data };
//   } catch (err) {
//     if (axios.isAxiosError(err)) {
//       console.log("Verify OTP error:", err.response?.data);
//       return {
//         success: false,
//         message: err.response?.data?.message || "OTP verification failed",
//         errors: err.response?.data?.errors || null,
//       };
//     }

//     console.error("Unexpected error:", err);
//     return {
//       success: false,
//       message: "An unexpected error occurred during OTP verification",
//     };
//   }
// }


export async function verifyOTP(formData: Record<string, unknown>) {
  console.log(formData);
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/validate-otp`,
      formData
    );
    console.log(res);
    return { 
      success: true, 
      data: res.data,
      message: res.data?.message || "OTP verified successfully" // ✅ Add message here
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log("Verify OTP error:", err.response?.data);
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed",
        errors: err.response?.data?.errors || null,
      };
    }

    console.error("Unexpected error:", err);
    return {
      success: false,
      message: "An unexpected error occurred during OTP verification",
    };
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    // Delete all auth-related cookies
    cookieStore.delete("token");
    cookieStore.delete("email");
    cookieStore.delete("phone");
    cookieStore.delete("referral_code");
    cookieStore.delete("phone_verified");
    console.log("Logout success: All cookies removed");
    return { success: true, message: "Logged out successfully" };
  } catch (err) {
    console.log("Logout error:", err);
    return {
      success: false,
      message: "Logout failed",
    };
  }
}