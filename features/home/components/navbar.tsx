// import Link from "next/link";
// import BranchDropdown from "./branchDropDown";

// export function Navbar() {
//   return (
//     <nav className="w-full h-[66px] bg-brand-white flex justify-between items-center">
//       {/* Logo */}
//       <div className="w-[107px] h-[43px] ">
//         <Link href={"/home"}>
//           <img src="/photos/trippldee-new-logo.png" alt="logo" />
//         </Link>
//       </div>
//       {/* Branch */}
//       <div className="flex flex-row items-center justify-center">
//         <BranchDropdown />
//       </div>
//       {/* Notifications */}
//       <div className="flex flex-row space-x-[36px]">
//         <img
//           className="cursor-pointer w-7 h-7"
//           src="/la-user-friends.svg"
//           alt=""
//         />
//         <div className="relative inline-block">
//           <img
//             className="cursor-pointer w-7 h-7"
//             src="/chat-bubble.svg"
//             alt="chat"
//           />
//           <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
//             23
//           </span>
//         </div>

//         <div className="relative inline-block">
//           <img
//             className="cursor-pointer w-7 h-7"
//             src="/notifications.svg"
//             alt="chat"
//           />
//           <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
//             23
//           </span>
//         </div>
//         this is account icon
//         <img
//           className="cursor-pointer w-7 h-7"
//           src="/account-circle.svg"
//           alt=""
//         />
//       </div>
//     </nav>
//   );
// }

// ("https://placehold.co/600x200/fd5f08/FFFFFF?text=Restaurant+Facade");



"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import BranchDropdown from "./branchDropDown";
import { logoutUser } from "@/server-actions/auth";

export function Navbar() {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
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
      <nav className="w-full h-[66px] bg-brand-white flex justify-between items-center px-4 border-b-2 border-orange-200">
        {/* Logo */}
        <div className="w-[107px] h-[43px]">
          <Link href={"/home"}>
            <img src="/photos/trippldee-new-logo.png" alt="logo" />
          </Link>
        </div>

        {/* Branch, Notifications & Account */}
        <div className="flex flex-row space-x-[36px] items-center">
          {/* Branch - Only show if type is not "User" */}
          {userType !== "User" && (
            <div className="flex flex-row items-center justify-center">
              <BranchDropdown />
            </div>
          )}
          <img
            className="cursor-pointer w-7 h-7"
            src="/la-user-friends.svg"
            alt="friends"
          />
          <div className="relative inline-block">
            <img
              className="cursor-pointer w-7 h-7"
              src="/chat-bubble.svg"
              alt="chat"
            />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
              23
            </span>
          </div>

          <div className="relative inline-block">
            <img
              className="cursor-pointer w-7 h-7"
              src="/notifications.svg"
              alt="notifications"
            />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-medium text-white">
              23
            </span>
          </div>

          {/* Account Dropdown */}
          <div className="relative inline-block">
            <img
              className="cursor-pointer w-7 h-7"
              src="/account-circle.svg"
              alt="account"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            />

            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
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
      </nav>
    </>
  );
}