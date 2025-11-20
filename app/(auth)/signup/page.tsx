import type { Metadata } from "next";

import VerifyCard from "@/features/auth/components/verify-card";
import { SignUpForm } from "../components/signupForm";
import { Providers } from "@/shared/components/providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function Signup() {
  return (
    <div className="w-screen min-h-screen grid grid-cols-2 grid-rows-3 max-md:grid-cols-1 max-md:grid-rows-1 max-md:bg-[url(/photos/authCouple.png)] max-md:bg-no-repeat max-md:bg-center max-md:bg-cover">
      <div className="bg-[url(/photos/authCouple.png)] bg-no-repeat bg-center bg-cover row-span-3 max-md:hidden"></div>
      <div className="bg-[url(/photos/Fork.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="bg-[url(/photos/couple-phone.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="bg-[url(/photos/burger.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="w-[100dvw] h-[100dvh] fixed flex items-center justify-center overflow-y-auto py-8 mt-10 max-md:py-4 max-md:mt-0 max-md:relative max-md:h-auto max-md:min-h-screen">
        <Providers>
          <SignUpForm />
        </Providers>
      </div>
      <Toaster />
    </div>
  );
}
