/**
 * Environment configuration
 * Centralizes all environment variable access with type safety
 */

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
  nodeEnv: process.env.NODE_ENV || "development",
} as const;

/**
 * Validates that required environment variables are set
 */
export function validateEnv() {
  if (!env.apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
}




