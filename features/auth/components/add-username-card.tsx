"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { setUsername, checkUsernameAvailability } from "@/server-actions/auth";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

const usernameSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

type Inputs = z.infer<typeof usernameSchema>;

export default function AddUsernameCard() {
  const [userData, setUserData] = useState({
    email: null as string | null,
    phone: null as string | null,
    phone_verified: null as boolean | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Username validation state
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(usernameSchema),
    mode: "onSubmit",
  });

  // Watch username field and debounce it
  const usernameValue = useWatch({ control, name: "username" });
  const debouncedUsername = useDebounce(usernameValue, 500);

  // Check username availability when debounced username changes
  useEffect(() => {
    const checkUsername = async () => {
      // Reset if username is empty or invalid format
      if (
        !debouncedUsername ||
        debouncedUsername.length < 4 ||
        !/^[a-zA-Z0-9_]+$/.test(debouncedUsername)
      ) {
        setUsernameCheckStatus({ checking: false, available: null, message: "" });
        return;
      }

      setUsernameCheckStatus({ checking: true, available: null, message: "" });

      const result = await checkUsernameAvailability(debouncedUsername);

      setUsernameCheckStatus({
        checking: false,
        available: result.data?.available ?? null,
        message: result.message || "",
      });
    };

    checkUsername();
  }, [debouncedUsername]);

  useEffect(() => {
    const getCookiesData = async () => {
      try {
        console.log("🔍 Fetching user data from cookies...");
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        
        console.log("📦 Raw cookie data received:", data);
        console.log("📧 Email:", data.email);
        console.log("📱 Phone:", data.phone);
        console.log("✅ Phone Verified (raw):", data.phone_verified);
        console.log("✅ Phone Verified (type):", typeof data.phone_verified);

        if (!data.email && !data.phone) {
          toast.error("Session not found, redirecting...");
          setTimeout(() => {
            router.push("/signup");
          }, 2000);
          return;
        }

        // Parse phone_verified correctly - it might be a string "true"/"false" from cookies
        const phoneVerified = data.phone_verified === true || data.phone_verified === "true";
        
        console.log("✅ Phone Verified (parsed):", phoneVerified);

        const userDataObj = {
          email: data.email || null,
          phone: data.phone || null,
          phone_verified: phoneVerified,
        };

        console.log("💾 Setting userData state:", userDataObj);
        setUserData(userDataObj);
        
      } catch (error) {
        console.error("❌ Error fetching cookies:", error);
        toast.error("Failed to load session data, redirecting...");
        setTimeout(() => {
          router.push("/signup");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    getCookiesData();
  }, [router]);

  const mutation = useMutation({
    mutationFn: async (formData: Inputs) => {
      return await setUsername(formData.username);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Username added successfully!");

        console.log("🎯 User data at submit time:", userData);
        console.log("🔍 Phone verified status:", userData.phone_verified);
        console.log("🔍 Phone verified type:", typeof userData.phone_verified);

        console.log("➡️ Redirecting to /home");
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to set username");

        // If there are specific field errors, show them
        if (data.errors) {
          Object.values(data.errors as { [key: string]: string }).forEach((val: string) => {
            toast.error(val);
          });
        }
      }
    },
    onError: (err: Error) => {
      console.log("❌ USERNAME SET EXCEPTION:", err);
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data: Inputs) => {
    // Prevent submission if username is not available
    if (usernameCheckStatus.available === false) {
      toast.error("Please choose a different username");
      return;
    }

    console.log("📝 Submitting username:", data.username);
    mutation.mutate(data);
  };

  const handleSkip = () => {
    toast.success("Username setup skipped");
    
    console.log("⏭️ Skip clicked - User data:", userData);
    console.log("🔍 Phone verified status:", userData.phone_verified);
    
    console.log("➡️ Redirecting to /home");
    setTimeout(() => {
      router.push("/home");
    }, 1000);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-fit h-fit bg-white/10 font-fira backdrop-blur-xl rounded-2xl border border-white/30 p-[30px] flex flex-col items-center justify-center gap-[30px] max-md:w-full max-md:max-w-[95vw] max-md:p-4 max-md:gap-4 max-md:mx-4"
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-6 h-6 animate-spin text-brand max-md:w-5 max-md:h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-black max-md:text-sm">Loading...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-fit h-fit bg-white/10 font-fira backdrop-blur-xl rounded-2xl border border-white/30 p-[30px] flex flex-col items-center justify-center gap-[30px] max-md:w-full max-md:max-w-[95vw] max-md:p-4 max-md:gap-4 max-md:mx-4"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-4 w-full max-md:gap-3"
      >
        <div className="text-center max-md:w-full">
          <h2 className="text-brand font-inter font-semibold text-3xl mb-2 max-md:text-2xl">
            Add Username
          </h2>
          <p className="text-sm text-black/80 max-w-[320px] max-md:text-xs max-md:px-2">
            Create a unique username for easy login instead of using email or phone number
          </p>
        </div>

        {(userData.email || userData.phone) && (
          <div className="text-xs text-black/60 bg-white/20 px-3 py-2 rounded-md max-md:text-[10px] max-md:px-2 max-md:py-1.5 max-md:w-full">
            Account: {userData.email || userData.phone}
            {/* Debug info - remove in production */}
            <div className="mt-1 text-[10px] max-md:text-[9px]">
              Phone Verified: {String(userData.phone_verified)}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full max-md:gap-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">Username</label>
          <div className="relative">
            <input
              {...register("username")}
              type="text"
              placeholder="Enter username"
              className="w-[320px] bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 pr-10 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 max-md:w-full max-md:h-[45px] max-md:text-sm"
            />
            {usernameCheckStatus.checking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="w-5 h-5 animate-spin text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
            {!usernameCheckStatus.checking && usernameCheckStatus.available === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xl">
                ✓
              </div>
            )}
            {!usernameCheckStatus.checking && usernameCheckStatus.available === false && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 font-bold text-xl">
                ✗
              </div>
            )}
          </div>

          {errors.username?.message && (
            <span className="text-red-500 text-sm max-md:text-xs">{errors.username.message}</span>
          )}
          {!errors.username && usernameCheckStatus.message && (
            <span
              className={
                usernameCheckStatus.available
                  ? "text-green-600 text-sm font-medium max-md:text-xs"
                  : "text-red-500 text-sm font-medium max-md:text-xs"
              }
            >
              {usernameCheckStatus.message}
            </span>
          )}
        </div>

        <div className="flex gap-4 mt-2 w-full max-md:gap-2 max-md:mt-1">
          <button
            type="submit"
            disabled={
              mutation.isPending ||
              usernameCheckStatus.available === false ||
              usernameCheckStatus.checking
            }
            className="flex-1 h-[50px] bg-brand text-white font-medium rounded-xl hover:bg-orange-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 max-md:h-[45px] max-md:text-sm"
          >
            {mutation.isPending ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin max-md:w-4 max-md:h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              "Save Username"
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={mutation.isPending}
            className="flex-1 h-[50px] bg-white/20 backdrop-blur-sm text-black font-medium rounded-xl hover:bg-white/30 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed border border-white/30 max-md:h-[45px] max-md:text-sm"
          >
            Skip
          </button>
        </div>
      </form>

      <p className="text-xs text-black/60 text-center max-w-[320px] max-md:text-[10px] max-md:px-2">
        You can also login using your email or phone number later
      </p>
    </motion.div>
  );
}