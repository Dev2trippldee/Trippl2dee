"use client";
import { SignInForm } from "../components/signinForm";
import { Providers } from "@/shared/components/providers";
import { Toaster } from "react-hot-toast";

export default function Signin() {
  return (
    <>
      <div className="w-screen h-screen grid grid-cols-2 grid-rows-3 max-md:grid-cols-1 max-md:grid-rows-1 max-md:h-auto max-md:min-h-screen max-md:bg-[url(/photos/authCouple.png)] max-md:bg-no-repeat max-md:bg-center max-md:bg-cover relative overflow-hidden">
        <div className="bg-[url(/photos/authCouple.png)] bg-no-repeat bg-center bg-cover row-span-3 max-md:hidden"></div>
        <div className="bg-[url(/photos/Fork.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
        <div className="bg-[url(/photos/couple-phone.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
        <div className="bg-[url(/photos/burger.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
        <div className="absolute inset-0 flex items-center justify-center max-md:relative max-md:inset-auto max-md:min-h-screen max-md:py-8">
          <Providers>
            <SignInForm />
          </Providers>
        </div>
      </div>
      <Toaster />
    </>
  );
}
