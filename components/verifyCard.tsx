"use client";

import { verifyOTP } from "@/server-actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { OTPInput, SlotProps } from "input-otp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const emailOTPSchema = z.object({
  emailOTP: z
    .string("Please Enter the OTP")
    .min(4, "Verification code must be 4 digits"),
});

const phoneOTPSchema = z.object({
  phoneOTP: z
    .string("Please Enter the OTP")
    .min(4, "Verification code must be 4 digits"),
});

const usernameSchema = z.object({
  username: z.string().min(4, "Username must be at least 4 characters"),
});

export default function VerifyCard() {
  const [userData, setUserData] = useState({
    email: null as string | null,
    phone: null as string | null,
    referralCode: null as string | null,
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Auto-redirect if only email exists and is verified
  useEffect(() => {
    if (emailVerified && !userData.phone) {
      const timer = setTimeout(() => {
        router.push("/signin");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [emailVerified, userData.phone, router]);

  useEffect(() => {
    const getCookiesData = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();

        if (!data.email) {
          toast.error("Email or Phone number not found, redirecting...");
          setTimeout(() => {
            router.push("/signup");
          }, 1000);
          setIsLoading(false);
          return;
        }

        setUserData({
          email: data.email,
          phone: data.phone,
          referralCode: data.referral_code || null,
        });
      } catch (error) {
        console.error("Error fetching cookies:", error);
        toast.error("Failed to load data, redirecting...");
        setTimeout(() => {
          router.push("/signup");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    getCookiesData();
  }, [router]);

  const handleNextClick = () => {
    router.push("/signin");
  };

  // Loader component
  if (isLoading) {
    return (
      <div className="w-fit h-fit bg-white/10 font-fira backdrop-blur-xl rounded-2xl border border-white/30 p-[30px] flex flex-col items-center justify-center gap-[30px]">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-6 h-6 animate-spin text-brand"
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
          <span className="text-black">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-fit h-fit bg-white/10 font-fira backdrop-blur-xl rounded-2xl border border-white/30 p-[30px] flex flex-col items-center justify-center gap-[30px]">
      {/* Email OTP Section */}
      {userData.email && (
        <EmailOTP 
          email={userData.email} 
          referralCode={userData.referralCode}
          onVerifySuccess={() => {
            setEmailVerified(true);
          }} 
        />
      )}
      {/* Phone Number OTP Section */}
      {userData.phone && (
        <>
          {!showPhoneOTP ? (
            <button
              onClick={() => setShowPhoneOTP(true)}
              className="w-[320px] py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-all cursor-pointer"
            >
              Verify your Phone Number
            </button>
          ) : (
            <PhoneOTP 
              phone_number={userData.phone} 
              referralCode={userData.referralCode}
              onVerifySuccess={() => {
                setPhoneVerified(true);
              }}
            />
          )}
        </>
      )}
      {/* Add Username Section */}
      {/*<Username />*/}
      
      {/* Next Button - Only show if phone exists, active only after email verification */}
      {userData.phone && (
        <button
          onClick={handleNextClick}
          disabled={!emailVerified}
          className="w-[320px] py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      )}
    </div>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={`w-[48px] h-[56px] flex items-center justify-center text-lg font-medium rounded-md border transition-all duration-150 bg-white/80 text-black
        ${props.isActive ? "border-orange-500 ring-2 ring-orange-500/40" : "border-gray-300"}
      `}
    >
      {props.char ?? ""}
    </div>
  );
}

function EmailOTP({ 
  email, 
  referralCode, 
  onVerifySuccess 
}: { 
  email: string; 
  referralCode: string | null; 
  onVerifySuccess: () => void 
}) {
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  
  type Inputs = z.infer<typeof emailOTPSchema>;
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(emailOTPSchema),
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: (formData: Inputs) => {
      const data = {
        email: email as string,
        otp: formData.emailOTP,
        reference_code: referralCode || undefined,
      };
      return verifyOTP(data);
    },
    onSuccess: (data) => {
      const { success, message } = data;
      if (success) {
        toast.success(message || "Verification successful!");
        setIsVerified(true);
        onVerifySuccess();
      } else {
        toast.error(message || "Verification failed. Please try again.");
      }
    },
    onError: (error) => {
      toast.error("An error occurred during verification");
      console.error(error);
    },
  });

  const onSubmit = (data: Inputs) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4"
    >
      <h2 className="text-2xl font-semibold text-orange-500">Email OTP</h2>
      <Controller
        control={control}
        name="emailOTP"
        render={({ field: { onChange, value } }) => (
          <OTPInput
            onChange={onChange}
            value={value}
            maxLength={6}
            disabled={isVerified}
            containerClassName="flex gap-4"
            className="focus-visible:outline-none focus-visible:ring-0"
            render={({ slots }) => (
              <div className="flex gap-4">
                {slots.map((slot, i) => (
                  <Slot key={i} {...slot} />
                ))}
              </div>
            )}
          />
        )}
      />
      {errors.emailOTP?.message && (
        <span className="text-red-600">{errors.emailOTP.message}</span>
      )}
      <button
        type="button"
        disabled={mutation.isPending}
        className="text-sm text-orange-500 hover:underline mt-1 disabled:text-gray-500"
      >
        Resend OTP
      </button>
      <button
        type="submit"
        disabled={mutation.isPending || isVerified}
        className="w-[320px] py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed relative overflow-hidden"
      >
        {mutation.isPending ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : isVerified ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Verified</span>
          </div>
        ) : (
          "Verify"
        )}
      </button>
    </form>
  );
}

function PhoneOTP({ 
  phone_number, 
  referralCode,
  onVerifySuccess
}: { 
  phone_number: string;
  referralCode: string | null;
  onVerifySuccess?: () => void;
}) {
  const [isVerified, setIsVerified] = useState(false);
  
  type Inputs = z.infer<typeof phoneOTPSchema>;
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(phoneOTPSchema),
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: (formData: Inputs) => {
      const data = {
        phone_number: phone_number as string,
        otp: formData.phoneOTP,
        reference_code: referralCode || undefined,
      };
      return verifyOTP(data);
    },
    onSuccess: (data) => {
      const { success, message } = data;
      if (success) {
        toast.success(message || "Verification successful!");
        setIsVerified(true);
        if (onVerifySuccess) {
          onVerifySuccess();
        }
      } else {
        toast.error(message || "Verification failed. Please try again.");
      }
    },
    onError: (error) => {
      toast.error("An error occurred during verification");
      console.error(error);
    },
  });

  const onSubmit = (data: Inputs) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4 mt-4"
    >
      <h2 className="text-2xl font-semibold text-orange-500">
        Phone Number OTP
      </h2>
      <Controller
        control={control}
        name="phoneOTP"
        render={({ field: { onChange, value } }) => (
          <OTPInput
            onChange={onChange}
            value={value}
            maxLength={4}
            disabled={isVerified}
            containerClassName="flex gap-4"
            className="focus-visible:outline-none focus-visible:ring-0"
            render={({ slots }) => (
              <div className="flex gap-4">
                {slots.map((slot, i) => (
                  <Slot key={i} {...slot} />
                ))}
              </div>
            )}
          />
        )}
      />
      {errors.phoneOTP?.message && (
        <span className="text-red-600">{errors.phoneOTP.message}</span>
      )}
      <button
        type="button"
        disabled={mutation.isPending}
        className="text-sm text-orange-500 hover:underline mt-1 disabled:text-gray-500"
      >
        Resend OTP
      </button>
      <button
        type="submit"
        disabled={mutation.isPending || isVerified}
        className="w-[320px] py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed relative overflow-hidden"
      >
        {mutation.isPending ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : isVerified ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Verified</span>
          </div>
        ) : (
          "Verify"
        )}
      </button>
    </form>
  );
}

function Username() {
  type Inputs = z.infer<typeof usernameSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(usernameSchema),
    mode: "onSubmit",
  });

  const onSubmit = (data: Inputs) => console.log(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-3 mt-4 w-full"
    >
      <h2 className="text-2xl font-semibold text-orange-500">Add Username</h2>
      <p className="text-sm text-gray-600 text-center">
        You can use this for login either than using
      </p>
      <input
        {...register("username")}
        type="text"
        placeholder="Email / Phone-number"
        className="w-[80%] px-4 py-3 rounded-md border border-white/30 bg-white text-black placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      {errors.username?.message && (
        <span className="text-red-600">{errors.username.message}</span>
      )}
      <div className="flex gap-4 mt-2">
        <button
          type="submit"
          className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-all"
        >
          Save
        </button>
        <button
          type="button"
          className="px-6 py-2 bg-white/20 text-white font-medium rounded-md hover:bg-white/30 transition-all"
        >
          Skip
        </button>
      </div>
    </form>
  );
}