/**
 * API client utilities
 * Centralizes API request configuration
 */

import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import type { ApiResponse } from "@/types/auth";

/**
 * Get axios instance with default configuration
 */
export function createApiClient(token?: string) {
  const client = axios.create({
    baseURL: env.apiUrl,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return client;
}

/**
 * Handle API errors consistently
 */
export function handleApiError<T>(
  err: unknown
): ApiResponse<T> {
  if (axios.isAxiosError(err)) {
    const error = err as AxiosError<{ message?: string; errors?: unknown; success?: boolean }>;
    return {
      success: false,
      message: error.response?.data?.message || "An unexpected error occurred",
      errors: error.response?.data?.errors || null,
    };
  }

  console.error("Unexpected error:", err);
  return {
    success: false,
    message: "An unexpected error occurred",
  };
}




