import { Providers } from "@/shared/components/providers";
import VerifyCard from "@/features/auth/components/verify-card";
import { Toaster } from "react-hot-toast";

export default function VerifyAuth() {
  return (
    <div className="w-screen h-screen grid grid-cols-2 grid-rows-3 max-md:grid-cols-1 max-md:grid-rows-1 max-md:h-auto max-md:min-h-screen max-md:bg-[url(/photos/authCouple.png)] max-md:bg-no-repeat max-md:bg-center max-md:bg-cover">
      <div className="bg-[url(/photos/authCouple.png)] bg-no-repeat bg-center bg-cover row-span-3 max-md:hidden"></div>
      <div className="bg-[url(/photos/Fork.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="bg-[url(/photos/couple-phone.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="bg-[url(/photos/burger.png)] bg-no-repeat bg-center bg-cover max-md:hidden"></div>
      <div className="w-[100dvw] h-[100dvh] fixed center-div max-md:relative max-md:h-auto max-md:min-h-screen max-md:py-8">
        <Providers>
          <VerifyCard />
        </Providers>
      </div>
      <Toaster />
    </div>
  );
}
