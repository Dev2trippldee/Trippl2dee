
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

const phoneOTPSchema = z.object({
  phoneOTP: z
    .string("Please Enter the OTP")
    .min(4, "Verification code must be 4 digits"),
});

interface UserData {
  phone: string | null;
  email: string | null;
  referralCode: string | null;
}

export default function PhoneVerifyCard() {
  const [userData, setUserData] = useState<UserData>({
    phone: null,
    email: null,
    referralCode: null,
  });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getCookiesData = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();

        if (!data.phone) {
          toast.error("Phone Number not found, redirecting...");
          setTimeout(() => {
            router.push("/home");
          }, 2000);
          setIsLoading(false);
          return;
        }

        setUserData({
          phone: data.phone,
          email: data.email || null,
          referralCode: data.referral_code || null,
        });
      } catch (error) {
        console.error("Error fetching cookies:", error);
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


  if (isLoading) {
    return (
      <div className="w-fit h-fit bg-white/10 font-fira backdrop-blur-xl rounded-2xl border border-white/30 p-[30px] flex flex-col items-center justify-center gap-[30px] max-md:w-full max-md:max-w-[95vw] max-md:p-4 max-md:gap-4 max-md:mx-4">
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
      </div>
    );
  }

  return (
    <div className="w-fit h-fit bg-white/10 font-fira backdrop-blur-xl rounded-2xl border border-white/30 p-[30px] flex flex-col items-center justify-center gap-[30px] max-md:w-full max-md:max-w-[95vw] max-md:p-4 max-md:gap-4 max-md:mx-4">
      {/* Phone Number OTP Section */}
      {userData.phone && (
        <PhoneOTP
          phone_number={userData.phone}
          referralCode={userData.referralCode}
          onVerifySuccess={() => setPhoneVerified(true)}
        />
      )}

    </div>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={`w-[48px] h-[56px] flex items-center justify-center text-lg font-medium rounded-md border transition-all duration-150 bg-white/80 text-black max-md:w-[40px] max-md:h-[48px] max-md:text-base
        ${props.isActive ? "border-orange-500 ring-2 ring-orange-500/40" : "border-gray-300"}
      `}
    >
      {props.char ?? ""}
    </div>
  );
}

function PhoneOTP({
  phone_number,
  referralCode,
  onVerifySuccess,
}: {
  phone_number: string;
  referralCode: string | null;
  onVerifySuccess: () => void;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  
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
        toast.success(message || "Phone verified successfully!");
        setIsVerified(true);
        // Trigger callback to enable Next button
        onVerifySuccess();
        // Auto-redirect after successful verification
        setTimeout(() => {
          router.push("/home");
        }, 1500);
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
      className="flex flex-col items-center gap-4 mt-4 max-md:gap-3 max-md:w-full max-md:mt-2"
    >
      <h2 className="text-2xl font-semibold text-orange-500 max-md:text-xl">
        Phone Number OTP
      </h2>
      <p className="text-sm text-black/80 max-w-[320px] max-md:text-xs max-md:px-2">
           You need to verify your phone number to continue
          </p>
      <Controller
        control={control}
        name="phoneOTP"
        render={({ field: { onChange, value } }) => (
          <OTPInput
            onChange={onChange}
            value={value}
            maxLength={4}
            disabled={isVerified}
            containerClassName="flex gap-4 max-md:gap-2"
            className="focus-visible:outline-none focus-visible:ring-0"
            render={({ slots }) => (
              <div className="flex gap-4 max-md:gap-2">
                {slots.map((slot, i) => (
                  <Slot key={i} {...slot} />
                ))}
              </div>
            )}
          />
        )}
      />
      {errors.phoneOTP?.message && (
        <span className="text-red-600 text-sm max-md:text-xs">{errors.phoneOTP.message}</span>
      )}
      <button
        type="button"
        disabled={mutation.isPending}
        className="text-sm text-orange-500 hover:underline mt-1 disabled:text-gray-500 max-md:text-xs"
      >
        Resend OTP
      </button>
      <button
        type="submit"
        disabled={mutation.isPending || isVerified}
        className="w-[320px] py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed relative overflow-hidden max-md:w-full max-md:text-sm max-md:py-2"
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