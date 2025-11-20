"use client";

import { useTokenMonitor } from "@/hooks/useTokenMonitor";

/**
 * Client component that monitors token and automatically logs out
 * when token is removed from storage
 */
export function TokenMonitor() {
  useTokenMonitor(2000); // Check every 2 seconds
  return null; // This component doesn't render anything
}


