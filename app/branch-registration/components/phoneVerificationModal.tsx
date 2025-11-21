"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { OTPInput, SlotProps } from "input-otp";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { validateEateryOTP } from "@/lib/api/eatery";
import { X } from "lucide-react";

const phoneOTPSchema = z.object({
  phoneOTP: z
    .string("Please Enter the OTP")
    .min(4, "Verification code must be 4 digits"),
});

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  eateryAlias: string;
  token: string;
  onVerifySuccess: () => void; // Called when Next button is clicked after verification
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

export function PhoneVerificationModal({
  isOpen,
  onClose,
  phoneNumber,
  eateryAlias,
  token,
  onVerifySuccess,
}: PhoneVerificationModalProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  type Inputs = z.infer<typeof phoneOTPSchema>;
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(phoneOTPSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: Inputs) => {
    setIsVerifying(true);
    try {
      const submitData = {
        phone_number: phoneNumber,
        otp: data.phoneOTP,
        reference_code: eateryAlias,
      };
      
      const response = await validateEateryOTP(submitData, token);
      
      if (response.success) {
        toast.success(response.message || "Phone verified successfully!");
        setIsVerified(true);
        setPhoneVerified(true);
        // Don't call onVerifySuccess here - wait for Next button click
      } else {
        toast.error(response.message || "Verification failed. Please try again.");
        reset();
      }
    } catch (error) {
      console.error("[PhoneVerificationModal] Error verifying OTP:", error);
      toast.error("An error occurred during verification");
      reset();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    if (!isVerified) {
      // Only allow closing if not verified, or ask for confirmation
      if (window.confirm("Are you sure you want to close? Phone verification is required to continue.")) {
        reset();
        onClose();
      }
    } else {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 md:p-8 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isVerifying}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center gap-4 mt-4"
        >
          <h2 className="text-2xl font-semibold text-brand">
            Phone Number Verification
          </h2>
          <p className="text-sm text-gray-600 text-center max-w-[320px]">
            Please verify your phone number to continue. We sent an OTP to{" "}
            <span className="font-medium">{phoneNumber}</span>
          </p>

          <Controller
            control={control}
            name="phoneOTP"
            render={({ field: { onChange, value } }) => (
              <OTPInput
                onChange={onChange}
                value={value}
                maxLength={4}
                disabled={isVerified || isVerifying}
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
            <span className="text-red-600 text-sm">{errors.phoneOTP.message}</span>
          )}

          <button
            type="button"
            disabled={isVerifying || isVerified}
            className="text-sm text-brand hover:underline mt-1 disabled:text-gray-500"
          >
            Resend OTP
          </button>

          <button
            type="submit"
            disabled={isVerifying || isVerified}
            className="w-full py-3 bg-brand text-white font-medium rounded-md hover:bg-orange-600 transition-all cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isVerifying ? (
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

          {phoneVerified && (
            <p className="text-sm text-green-600 font-medium mt-2">
              ✓ Phone number verified successfully!
            </p>
          )}

          {/* Next Button - Only enabled after phone verification */}
          {phoneVerified && (
            <button
              type="button"
              onClick={onVerifySuccess}
              className="w-full py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-all cursor-pointer mt-4"
            >
              Next
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

