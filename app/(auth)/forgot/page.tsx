import ForgotPasswordCard from "@/features/auth/components/forgot-password-card";
import { Providers } from "@/shared/components/providers";
import { Toaster } from "react-hot-toast";

export default function ForgotPassword() {
  return (
    <div className="w-screen h-screen grid grid-cols-2 grid-rows-3 max-md:grid-cols-1 max-md:grid-rows-1 max-md:h-auto max-md:min-h-screen max-md:bg-[url(/photos/authCouple.png)] max-md:bg-no-repeat max-md:bg-center max-md:bg-cover">
      <div className="bg-[url(/photos/authCouple.png)] bg-no-repeat bg-center bg-cover row-span-3 max-md:hidden"></div>
      <div className="bg-[url(/photos/Fork.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="bg-[url(/photos/couple-phone.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="bg-[url(/photos/burger.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      
      {/* Fixed centering div - using Tailwind utilities instead of custom class */}
      <div className="w-[100dvw] h-[100dvh] fixed inset-0 flex items-center justify-center z-10 max-md:relative max-md:h-auto max-md:min-h-screen max-md:py-8">
        <Providers>
          <ForgotPasswordCard />
        </Providers>
      </div>
      
      <Toaster />
    </div>
  );
}