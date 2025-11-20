"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/server-actions/auth";
import toast from "react-hot-toast";

/**
 * Hook to monitor token and automatically logout when token is removed
 * Checks for token presence periodically and triggers logout if token is missing
 */
export function useTokenMonitor(checkInterval: number = 2000) {
  const router = useRouter();
  const hasLoggedOut = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only monitor on client side
    if (typeof window === "undefined") return;

    const checkToken = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();

        // If token is missing and we haven't already logged out
        if (!data.token && !hasLoggedOut.current) {
          hasLoggedOut.current = true;

          // Clear the interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Show notification
          toast.error("Session expired. Please login again.");

          // Call logout to clean up any remaining cookies
          try {
            await logoutUser();
          } catch (error) {
            console.error("Error during auto-logout:", error);
          }

          // Redirect to signin page
          router.push("/signin");
          router.refresh();
        }
      } catch (error) {
        console.error("Error checking token:", error);
        // If there's an error checking token, don't auto-logout
        // It might be a network issue
      }
    };

    // Check immediately
    checkToken();

    // Set up interval to check periodically
    intervalRef.current = setInterval(checkToken, checkInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [router, checkInterval]);
}

