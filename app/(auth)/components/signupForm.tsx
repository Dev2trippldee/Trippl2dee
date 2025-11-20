"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useWatch } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { registerUser, checkEmailAvailability, checkPhoneAvailability } from "@/server-actions/auth";
import { useDebounce } from "@/hooks/useDebounce";
import { Eye, EyeOff } from "lucide-react";

const signUpSchema = z
  .object({
    name: z.string().min(3, "Name should be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    account_type_alias: z.string().min(1, "Please select a user type"),
    phone_number: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })
  .refine((data) => {
    // Phone is optional - only validate if a meaningful value is provided
    const phone = data.phone_number;
    
    // If phone is undefined, null, empty string, or just country code, it's valid (optional)
    if (!phone || phone.trim().length === 0) {
      return true;
    }
    
    // If phone is just a country code (like "+91" or "+1"), treat as empty/optional
    if (phone.trim().length <= 4) {
      return true;
    }
    
    // If phone is provided, it must be at least 13 characters (country code + number)
    return phone.length >= 13;
  }, {
    message: "Enter full phone number with country code",
    path: ["phone_number"],
  });

export type Inputs = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      account_type_alias: "",
      phone_number: "",
      password: "",
      password_confirmation: "",
    },
  });

  // Email validation state
  const [emailCheckStatus, setEmailCheckStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  // Phone validation state
  const [phoneCheckStatus, setPhoneCheckStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account creation success state
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  // Watch email and phone fields and debounce them
  const emailValue = useWatch({ control, name: "email" });
  const phoneValue = useWatch({ control, name: "phone_number" });
  const debouncedEmail = useDebounce(emailValue, 500);
  const debouncedPhone = useDebounce(phoneValue, 500);

  // Check email availability when debounced email changes
  useEffect(() => {
    const checkEmail = async () => {
      // Reset if email is empty or invalid
      if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
        setEmailCheckStatus({ checking: false, available: null, message: "" });
        return;
      }

      setEmailCheckStatus({ checking: true, available: null, message: "" });

      const result = await checkEmailAvailability(debouncedEmail);

      setEmailCheckStatus({
        checking: false,
        available: result.data?.available ?? null,
        message: result.message || "",
      });
    };

    checkEmail();
  }, [debouncedEmail]);

  // Check phone availability when debounced phone changes
  useEffect(() => {
    const checkPhone = async () => {
      // Reset if phone is empty or too short (phone is optional)
      if (!debouncedPhone || debouncedPhone.length === 0 || debouncedPhone.length < 13) {
        setPhoneCheckStatus({ checking: false, available: null, message: "" });
        return;
      }

      setPhoneCheckStatus({ checking: true, available: null, message: "" });

      const result = await checkPhoneAvailability(debouncedPhone);

      setPhoneCheckStatus({
        checking: false,
        available: result.data?.available ?? null,
        message: result.message || "",
      });
    };

    checkPhone();
  }, [debouncedPhone]);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("REGISTER RESPONSE:", data);

      if (data?.success) {
        toast.success(data?.message || "Registered successfully!");
        setIsAccountCreated(true);

        setTimeout(() => {
          router.push("/verify");
        }, 1000);
      } else {
        console.log("REGISTER ERROR:", data);
        const errors = data?.errors || {};
        if (Object.keys(errors).length > 0) {
          Object.values(errors).forEach((val: unknown) => {
            if (Array.isArray(val)) {
              val.forEach((msg) => toast.error(msg));
            } else toast.error(String(val));
          });
        } else {
          toast.error(data?.message || "Registration failed");
        }
      }
    },
    onError: (err: Error) => {
      console.log("REGISTER EXCEPTION:", err);
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data: Inputs) => {
    console.log("REGISTER USER formdata", data);

    // Prevent submission if email is not available
    if (emailCheckStatus.available === false) {
      toast.error("Please use a different email address");
      return;
    }

    // Check if phone number is meaningful (not empty and not just country code)
    const phone = data.phone_number?.trim();
    const hasValidPhone = phone && phone.length > 4 && phone.length >= 13;

    // Prevent submission if phone is provided but not available
    if (hasValidPhone && phoneCheckStatus.available === false) {
      toast.error("Please use a different phone number");
      return;
    }

    // Remove phone_number from data if it's empty or just country code
    const submitData = {
      ...data,
      phone_number: hasValidPhone ? phone : undefined,
    };

    mutation.mutate(submitData);
  };

  return (
    <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={handleSubmit(onSubmit)}
        className="w-fit h-fit bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-[30px] flex flex-col items-center gap-[26px] mt-74 mb-14 max-md:w-full max-md:max-w-[95vw] max-md:p-4 max-md:gap-4 max-md:mt-0 max-md:mb-4 max-md:mx-4"
      >
      <div className="max-md:w-full">
        <h2 className="text-brand font-inter font-semibold text-3xl center-div max-md:text-2xl">
          Trippldee
        </h2>
        <span className="text-black font-inter font-normal text-[20px] center-div max-md:text-base max-md:block max-md:text-center max-md:px-2">
          Welcome to Trippldee, please create your account.
        </span>
      </div>

      {/* Toggle */}
      <div className="w-full h-[60px] flex items-center justify-center bg-[#fff3e5] rounded-full p-2 transition-all max-md:h-[50px]">
        <button
          type="button"
          className="bg-white flex-1 text-[#fd5f08] font-medium rounded-full h-full shadow-sm max-md:text-sm"
        >
          Sign Up
        </button>
        <Link
          href="/signin"
          className="flex-1 text-black font-medium text-center px-6 py-2 hover:bg-white/40 rounded-full transition max-md:text-sm max-md:px-4"
        >
          Login
        </Link>
      </div>

      {/* Fields */}
      <div className="grid gap-4 w-full max-md:gap-3">
        {/* Full Name */}
        <div className="flex flex-col gap-[6px] relative max-md:gap-1.5 max-md:pb-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">Full Name</label>
          <div className="relative pb-[0.2px]">
            <input
              {...register("name")}
              type="text"
              placeholder="Enter your full name"
              className="w-full bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 max-md:h-[45px] max-md:text-sm"
            />
            {errors.name && (
              <span className="text-red-500 text-sm max-md:text-xs absolute top-full left-0 flex items-center max-md:mt-0.5 max-md:leading-tight" style={{ height: '16px', marginTop: 'calc((16px - 1em) / 2)' }}>{errors.name.message}</span>
            )}
          </div>
        </div>

        {/* Email with real-time validation */}
        <div className="flex flex-col gap-[6px] relative max-md:gap-1.5 max-md:pb-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">Email Address</label>
          <div className="relative pb-[0.2px]">
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="w-full bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 pr-10 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 max-md:h-[45px] max-md:text-sm"
            />
            {emailCheckStatus.checking && (
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
            {!emailCheckStatus.checking && emailCheckStatus.available === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xl">
                ✓
              </div>
            )}
            {!emailCheckStatus.checking && emailCheckStatus.available === false && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 font-bold text-xl">
                ✗
              </div>
            )}
            {errors.email && (
              <span className="text-red-500 text-sm max-md:text-xs absolute top-full left-0 flex items-center max-md:mt-0.5 max-md:leading-tight" style={{ height: '16px', marginTop: 'calc((16px - 1em) / 2)' }}>{errors.email.message}</span>
            )}
            {!errors.email && emailCheckStatus.message && (
              <span
                className={`absolute top-full left-0 flex items-center max-md:mt-0.5 max-md:leading-tight ${
                  emailCheckStatus.available
                    ? "text-green-600 text-sm max-md:text-xs font-medium"
                    : "text-red-500 text-sm max-md:text-xs font-medium"
                }`}
                style={{ height: '16px', marginTop: 'calc((16px - 1em) / 2)' }}
              >
                {emailCheckStatus.message}
              </span>
            )}
          </div>
        </div>

        {/* Account Type */}
        <div className="flex flex-col gap-[6px] relative max-md:gap-1.5 max-md:pb-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">Choose User Type</label>
          <div className="relative pb-[0.2px]">
            <Controller
              control={control}
              name="account_type_alias"
              render={({ field: { onChange, value } }) => (
                <select
                  value={value}
                  onChange={onChange}
                  className="w-full bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 appearance-none max-md:h-[45px] max-md:text-sm"
                >
                  <option value="" disabled>
                    Select Account Type
                  </option>
                  <option value="acc.user">User</option>
                  <option value="acc.organization">Organization</option>
                </select>
              )}
            />
            {errors.account_type_alias && (
              <span className="text-red-500 text-sm max-md:text-xs absolute top-full left-0 flex items-center max-md:mt-0.5 max-md:leading-tight" style={{ height: '16px', marginTop: 'calc((16px - 1em) / 2)' }}>{errors.account_type_alias.message}</span>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-[6px] relative max-md:gap-1.5 max-md:pb-1">
          <label className="font-fira text-[16px] font-medium max-md:text-sm">Phone number <span className="text-gray-500 text-sm max-md:text-xs">(Optional)</span></label>
          <div className="relative pb-[0.2px]">
            <Controller
              control={control}
              name="phone_number"
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  value={value}
                  onChange={onChange}
                  defaultCountry="in"
                  inputProps={{ placeholder: "Enter your Mobile no" }}
                  inputStyle={{
                    width: "100%",
                    height: "50px",
                    borderRadius: "12px",
                    background: "#fff3e5",
                    paddingRight: "40px",
                  }}
                />
              )}
            />
            {phoneCheckStatus.checking && (
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
            {!phoneCheckStatus.checking && phoneCheckStatus.available === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xl">
                ✓
              </div>
            )}
            {!phoneCheckStatus.checking && phoneCheckStatus.available === false && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 font-bold text-xl">
                ✗
              </div>
            )}
            {errors.phone_number && (
              <span className="text-red-500 text-sm max-md:text-xs absolute top-full left-0 flex items-center max-md:mt-0.5 max-md:leading-tight" style={{ height: '16px', marginTop: 'calc((16px - 1em) / 2)' }}>{errors.phone_number.message}</span>
            )}
            {!errors.phone_number && phoneCheckStatus.message && (
              <span
                className={`absolute top-full left-0 flex items-center max-md:mt-0.5 max-md:leading-tight ${
                  phoneCheckStatus.available
                    ? "text-green-600 text-sm max-md:text-xs font-medium"
                    : "text-red-500 text-sm max-md:text-xs font-medium"
                }`}
                style={{ height: '16px', marginTop: 'calc((16px - 1em) / 2)' }}
              >
                {phoneCheckStatus.message}
              </span>
            )}
          </div>
        </div>

        {/* Passwords */}
        {["password", "password_confirmation"].map((name, idx) => (
          <div key={name} className="flex flex-col gap-[6px] relative max-md:gap-1.5 max-md:pb-1">
            <label className="font-fira text-[16px] font-medium max-md:text-sm">
              {idx === 0 ? "Password" : "Confirm Password"}
            </label>
            <div className="relative pb-[0.2px]">
              <input
                {...register(name as keyof Inputs)}
                type={
                  idx === 0
                    ? showPassword
                      ? "text"
                      : "password"
                    : showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your Password"
                className="w-full bg-[#fff3e5] h-[50px] text-black rounded-xl border border-[#c7b8a2] px-4 py-2 pr-12 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#fd5f08]/30 max-md:h-[45px] max-md:text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  idx === 0
                    ? setShowPassword(!showPassword)
                    : setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {(idx === 0 ? showPassword : showConfirmPassword) ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors[name as keyof Inputs] && (
                <span className="text-red-500 text-sm max-md:text-xs absolute top-full left-0 flex items-center max-md:mt-0.5 max-md:leading-tight" style={{ height: '16px', marginTop: 'calc((16px - 1em) / 2)' }}>
                  {errors[name as keyof Inputs]?.message as string}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={
          Boolean(mutation.isPending ||
          emailCheckStatus.available === false ||
          emailCheckStatus.checking ||
          (phoneValue && phoneValue.length > 0 && (phoneCheckStatus.available === false || phoneCheckStatus.checking)))
        }
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
        <span>{mutation.isPending ? "You are SigingUp" : "Create Account"}</span>
      </button>

      <h4 className="font-inter font-normal text-[20px] max-md:text-sm max-md:text-center max-md:px-2">
        Already have an account?{" "}
        <Link className="text-brand hover:underline" href="/signin">
          Login here
        </Link>
      </h4>
    </motion.form>
  );
}