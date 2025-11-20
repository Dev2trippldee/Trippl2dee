import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/lib/constants/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, password_confirmation, token, email } = body;

    // Validate required fields
    if (!password || !password_confirmation || !token || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          data: [],
          code: 400,
        },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
          data: [],
          code: 400,
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
          data: [],
          code: 400,
        },
        { status: 400 }
      );
    }

    // Call the backend API
    try {
      const response = await axios.post(
        API_ENDPOINTS.USER.RESET_PASSWORD,
        {
          password,
          password_confirmation,
          token,
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return NextResponse.json(
        {
          success: response.data?.success || false,
          message: response.data?.message || "Password reset successfully",
          data: response.data?.data || [],
          code: 200,
        },
        { status: 200 }
      );
    } catch (err) {
      const error = err as AxiosError<{ message?: string; success?: boolean }>;

      console.log("Backend reset password error:", error.response?.data);

      return NextResponse.json(
        {
          success: false,
          message: error.response?.data?.message || "This password reset token is invalid.",
          data: [],
          code: 200,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Reset password route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        data: [],
        code: 500,
      },
      { status: 500 }
    );
  }
}

