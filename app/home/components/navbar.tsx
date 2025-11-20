"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import BranchDropdown from "./branchDropDown";
import { logoutUser } from "@/server-actions/auth";

export function Navbar() {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user type from cookies
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        setUserType(data.type || null);
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    };

    fetchUserType();
  }, []);

  const handleLogout = async () => {
    try {
      const toastId = toast.loading("Logging out...");
      setIsAccountMenuOpen(false);
      setIsMobileMenuOpen(false);
      
      const result = await logoutUser();
      
      if (result.success) {
        toast.success("Logged out successfully", { id: toastId });
        
        // Wait for 2 seconds before redirecting to show the success message
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        router.push("/signin");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to logout", { id: toastId });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    }
  };

  return (
    <>
      <Toaster />
      <nav className="w-full min-h-[66px] bg-brand-white flex justify-between items-center px-3 sm:px-4 border-b-2 border-orange-200 relative z-40">
        {/* Logo */}
        <div className="flex-shrink-0 w-20 sm:w-[107px] h-auto">
          <Link href={"/home"} className="block">
            <img 
              src="/photos/trippldee-new-logo.png" 
              alt="logo" 
              className="w-full h-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-row items-center gap-4 lg:gap-9">
          {/* Branch - Only show if type is not "User" */}
          {userType !== "User" && (
            <div className="flex flex-row items-center justify-center">
              <BranchDropdown />
            </div>
          )}
          
          {/* Friends Icon */}
          <button className="relative p-1.5 hover:bg-orange-50 rounded-lg transition-colors">
            <img
              className="w-6 h-6 sm:w-7 sm:h-7"
              src="/la-user-friends.svg"
              alt="friends"
            />
          </button>

          {/* Chat Icon */}
          <button className="relative p-1.5 hover:bg-orange-50 rounded-lg transition-colors">
            <img
              className="w-6 h-6 sm:w-7 sm:h-7"
              src="/chat-bubble.svg"
              alt="chat"
            />
            <span className="absolute top-0 right-0 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] sm:text-[12px] font-medium text-white">
              23
            </span>
          </button>

          {/* Notifications Icon */}
          <button className="relative p-1.5 hover:bg-orange-50 rounded-lg transition-colors">
            <img
              className="w-6 h-6 sm:w-7 sm:h-7"
              src="/notifications.svg"
              alt="notifications"
            />
            <span className="absolute top-0 right-0 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] sm:text-[12px] font-medium text-white">
              23
            </span>
          </button>

          {/* Account Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <img
                className="w-6 h-6 sm:w-7 sm:h-7"
                src="/account-circle.svg"
                alt="account"
              />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Messages Icon */}
          <button className="relative p-1.5 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0">
            <img
              className="w-9 h-9 min-w-[36px] min-h-[36px] object-contain"
              src="/chat-bubble.svg"
              alt="chat"
            />
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
              23
            </span>
          </button>

          {/* Notifications Icon */}
          <button className="relative p-1.5 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0">
            <img
              className="w-9 h-9 min-w-[36px] min-h-[36px] object-contain"
              src="/notifications.svg"
              alt="notifications"
            />
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
              23
            </span>
          </button>

          {/* Account Icon */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                setIsAccountMenuOpen(!isAccountMenuOpen);
                setIsMobileMenuOpen(false);
              }}
              className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <img
                className="w-9 h-9 min-w-[36px] min-h-[36px] object-contain"
                src="/account-circle.svg"
                alt="account"
              />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsAccountMenuOpen(false);
            }}
            className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-9 h-9 min-w-[36px] min-h-[36px] text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-9 h-9 min-w-[36px] min-h-[36px] text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b-2 border-orange-200 shadow-lg md:hidden z-50">
            <div className="px-4 py-4 space-y-4">
              {/* Branch Dropdown - Only show if type is not "User" */}
              {userType !== "User" && (
                <div className="border-b border-gray-200 pb-4">
                  <BranchDropdown />
                </div>
              )}

              {/* Mobile Menu Items */}
              <div className="flex flex-col space-y-3">
                {/* Friends */}
                <button className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-lg transition-colors text-left">
                  <img
                    className="w-6 h-6"
                    src="/la-user-friends.svg"
                    alt="friends"
                  />
                  <span className="text-gray-700 font-medium">Friends</span>
                </button>

                {/* Chat */}
                <button className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-lg transition-colors text-left relative">
                  <img
                    className="w-6 h-6"
                    src="/chat-bubble.svg"
                    alt="chat"
                  />
                  <span className="text-gray-700 font-medium">Messages</span>
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
                    23
                  </span>
                </button>

                {/* Notifications */}
                <button className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-lg transition-colors text-left relative">
                  <img
                    className="w-6 h-6"
                    src="/notifications.svg"
                    alt="notifications"
                  />
                  <span className="text-gray-700 font-medium">Notifications</span>
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
                    23
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}