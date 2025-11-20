"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetLink } from "@/server-actions/auth";


const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type Inputs = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: Inputs) => {
    setIsLoading(true);
    
    try {
      const result = await sendPasswordResetLink(data.email);
      
      if (result.success) {
        toast.success(result.message || "Password reset link sent to your email!");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            Enter your email address and well send you a link to reset your password
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full max-md:gap-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">Email Address</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
            className="w-[320px] bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:h-[45px] max-md:text-sm"
          />

          {errors.email?.message && (
            <span className="text-red-500 text-sm max-md:text-xs">{errors.email.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[50px] bg-brand text-white font-medium rounded-xl hover:bg-orange-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 max-md:h-[45px] max-md:text-sm"
        >
          {isLoading ? "Sending..." : "Get the Link"}
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

      <p className="text-xs text-black/60 text-center max-w-[320px] max-md:text-[10px] max-md:px-2">
        Check your spam folder if you dont receive the email within a few minutes
      </p>
    </motion.div>
  );
}