"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { loginUser } from "@/server-actions/auth";
import { setAuthCookies } from "@/server-actions/cookies";
import { Eye, EyeOff } from "lucide-react";

const signinSchema = z.object({
  login: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type Inputs = z.infer<typeof signinSchema>;

export function SignInForm() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(signinSchema),
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (formData: Inputs) => loginUser(formData),
    onSuccess: async (response) => {
      if (response.success) {
        toast.success(response.message || "Login successful");
        const token = response.data?.access_token;
        const isFirstLogin = response.data?.is_first_login;
        const isPhoneNumberVerified = response.data?.user?.phone_number_verified || false;
        const phoneNumber = response.data?.user?.phone_number || null;

        console.log("Login response:", response);
        console.log("Token:", token);
        console.log("Phone number verified:", isPhoneNumberVerified);
        console.log("Phone number:", phoneNumber);
        console.log("Is first login:", isFirstLogin);

        if (token) {
          // Set both token and phone verification status together
          await setAuthCookies(token, isPhoneNumberVerified);
          console.log("Auth cookies set successfully");

          // Route based on is_first_login status and phone number
          // If phone_number is null, go to /home instead of /verifyphone
          if (isFirstLogin === false && isPhoneNumberVerified === false && phoneNumber !== null) {
            router.push("/verifyphone");
          } else {
            if (isFirstLogin === true) {
              router.push("/addusername");
            } else {
              router.push("/home");
            }
          }

         
        } else {
          toast.error("No token received from server");
        }
      } else {
        toast.error(response.message || "Invalid credentials");
      }
    },
    onError: (error) => {
      setProgress(0);
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    },
  });

  const onSubmit = (data: Inputs) => {
    mutation.mutate(data);
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="w-fit h-fit bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-[30px] flex flex-col justify-center items-center gap-[26px] max-md:w-full max-md:max-w-[95vw] max-md:p-4 max-md:gap-4 max-md:mx-4"
      style={{ willChange: "opacity, transform" }}
    >
      <div className="max-md:w-full">
        <h2 className="text-brand font-inter font-semibold text-3xl center-div max-md:text-2xl">
          Trippldee
        </h2>
        <span className="text-black font-inter font-normal text-[20px] center-div max-md:text-base max-md:block max-md:text-center max-md:px-2">
          Welcome to Trippldee, please login to your account.
        </span>
      </div>

      {/* Toggle */}
      <div className="w-full h-[60px] flex items-center justify-center bg-[#fff3e5] rounded-full p-2 transition-all max-md:h-[50px]">
        <Link
          href="/signup"
          className="flex-1 text-black font-medium px-6 py-2 text-center hover:bg-white/40 rounded-full transition max-md:text-sm max-md:px-4"
        >
          Sign Up
        </Link>
        <button
          type="button"
          className="bg-white flex-1 text-[#fd5f08] font-medium rounded-full h-full shadow-sm max-md:text-sm"
        >
          Login
        </button>
      </div>

      {/* Email */}
      <div className="w-full flex flex-col gap-[10px] relative max-md:gap-2.5">
        <label className="font-fira text-[16px] font-medium max-md:text-sm">Email Address</label>
        <div className="relative">
          <input
            {...register("login")}
            type="email"
            placeholder="Enter your email"
            className="w-full bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 max-md:h-[45px] max-md:text-sm"
          />
          {errors.login && (
            <span className="text-red-600 text-sm max-md:text-xs absolute top-full left-0 mt-[2px] max-md:mt-1 max-md:leading-tight">{errors.login.message}</span>
          )}
        </div>
      </div>

      {/* Password with toggle */}
      <div className="w-full flex flex-col gap-[10px] relative max-md:gap-2.5">
        <label className="font-fira text-[16px] font-medium max-md:text-sm">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your Password"
            className="w-full bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 pr-12 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 max-md:h-[45px] max-md:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {errors.password && (
            <span className="text-red-600 text-sm max-md:text-xs absolute top-full left-0 mt-[2px] max-md:mt-1 max-md:leading-tight">{errors.password.message}</span>
          )}
        </div>
      </div>

      <Link className="text-brand hover:underline max-md:text-sm" href="/forgot">
        Forgot Password?
      </Link>

      <button
        disabled={mutation.isPending}
        type="submit"
        className="w-full rounded-[12px] h-[50px] bg-brand text-white font-medium transition-all duration-200 hover:bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 max-md:h-[45px] max-md:text-sm"
      >
        {mutation.isPending && (
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
        )}
        <span>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </span>
      </button>

      <h4 className="font-inter font-normal text-[20px] max-md:text-sm max-md:text-center max-md:px-2">
        {"Don't have an account? "}
        <Link className="text-brand hover:underline" href="/signup">
          Create one
        </Link>
      </h4>
    </motion.form>
  );
}