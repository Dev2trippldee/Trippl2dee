"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { resetPassword } from "@/server-actions/auth";
import { Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string().min(8, "Password confirmation must be at least 8 characters"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type Inputs = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");
    
    if (!tokenParam || !emailParam) {
      toast.error("Invalid reset link. Missing token or email.");
      setTimeout(() => {
        router.push("/forgot");
      }, 2000);
      return;
    }
    
    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: Inputs) => {
    if (!token || !email) {
      toast.error("Invalid reset link");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await resetPassword({
        password: data.password,
        password_confirmation: data.password_confirmation,
        token: token,
        email: email,
      });
      
      if (result.success) {
        toast.success(result.message || "Password reset successfully!");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-fit h-fit bg-white/10 font-fira backdrop-blur-xl rounded-2xl border border-white/30 p-[30px] flex flex-col items-center justify-center gap-[30px] max-md:w-full max-md:max-w-[95vw] max-md:p-4 max-md:gap-4 max-md:mx-4"
      >
        <div className="text-center max-md:w-full">
          <h2 className="text-brand font-inter font-semibold text-3xl mb-2 max-md:text-2xl">
            Trippldee
          </h2>
          <p className="text-sm text-black/80 max-w-[320px] max-md:text-xs max-md:px-2">
            Invalid reset link. Redirecting...
          </p>
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
            Trippldee
          </h2>
          <p className="text-sm text-black/80 max-w-[320px] max-md:text-xs max-md:px-2">
            Enter your new password to reset your account
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full max-md:gap-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">New Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              disabled={isLoading}
              className="w-[320px] bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 pr-12 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:h-[45px] max-md:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 max-md:w-4 max-md:h-4" />
              ) : (
                <Eye className="w-5 h-5 max-md:w-4 max-md:h-4" />
              )}
            </button>
          </div>
          {errors.password?.message && (
            <span className="text-red-500 text-sm max-md:text-xs">{errors.password.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full max-md:gap-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">Confirm Password</label>
          <div className="relative">
            <input
              {...register("password_confirmation")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              disabled={isLoading}
              className="w-[320px] bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 pr-12 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:h-[45px] max-md:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 max-md:w-4 max-md:h-4" />
              ) : (
                <Eye className="w-5 h-5 max-md:w-4 max-md:h-4" />
              )}
            </button>
          </div>
          {errors.password_confirmation?.message && (
            <span className="text-red-500 text-sm max-md:text-xs">{errors.password_confirmation.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[50px] bg-brand text-white font-medium rounded-xl hover:bg-orange-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 max-md:h-[45px] max-md:text-sm"
        >
          {isLoading ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
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
              <span>Resetting...</span>
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="text-center max-md:w-full">
        <p className="text-sm text-black/80 max-md:text-xs">
          Remember your password?{" "}
          <Link href="/signin" className="text-brand hover:underline font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

