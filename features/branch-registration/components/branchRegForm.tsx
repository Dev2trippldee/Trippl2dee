"use client";
import { Progress } from "@ark-ui/react";
import { MapPinPlus } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { BranchRegFormProps } from "@/app/branch-registration/page";

export function BranchRegForm({ setStep }: BranchRegFormProps) {
  return (
    <div className="bg-brand-white flex-4 font-fira rounded-3xl overflow-clip">
      <Progress.Root value={30} className="w-full">
        {/*<Progress.Label>Label</Progress.Label>*/}
        <Progress.Track className="rounded-2xl ">
          <Progress.Range className="bg-teal-400 h-3" />
        </Progress.Track>
        <Progress.ValueText className="pl-[27%]" />
      </Progress.Root>

      <div className="p-[30px]">
        <form action="" className="w-full space-y-[20px]">
          <div className="text-brand flex justify-start gap-3 items-center pb-[10px]">
            <MapPinPlus className="w-[36px]" />
            <h3 className="font-inter text-[28px] font-semibold">
              Branch Information
            </h3>
          </div>

          <div className="flex flex-col gap-[15px]">
            <label htmlFor="branch name" className="text-[18px] ">
              Branch Name
            </label>
            <input
              type="text"
              name="branch-name"
              placeholder=" Enter branch name"
              className="bg-brand-bg-200 pl-3 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex flex-col gap-[15px]">
            <label htmlFor="branch-type" className="text-[18px]">
              Branch Type
            </label>
            <select
              name="branch-type"
              className="bg-brand-bg-200 rounded-lg w-full h-[50px] border border-gray-200 px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Select a branch</option>
              <option value="kochi">Kochi</option>
              <option value="chennai">Chennai</option>
              <option value="bangalore">Bangalore</option>
            </select>
          </div>

          <div className="flex flex-col gap-[20px]">
            <label htmlFor="address" className="text-[18px]">
              Address
            </label>
            <textarea
              name="address"
              rows={4}
              className="bg-brand-bg-200 rounded-md w-full border border-gray-200 p-3 text-[16px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter complete address"
            ></textarea>

            <div className="flex gap-[20px]">
              <div className="flex flex-col flex-1 gap-[15px]">
                <label htmlFor="pincode" className="text-[18px] ">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder=" Enter pincode"
                  className="bg-brand-bg-200  pl-2 rounded-lg h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="flex flex-col flex-1 gap-[15px]">
                <label htmlFor="phone" className="text-[18px]">
                  Phone Number
                </label>
                <PhoneInput
                  name="phone"
                  inputStyle={{
                    width: "100%",
                    height: "50px",
                    borderRadius: "0px 12px 12px 0px",
                    background: "#fff3e5",
                  }}
                  defaultCountry="in"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[15px]">
            <label htmlFor="email" className="text-[18px] ">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder={`Enter email`}
              className="bg-brand-bg-200 pl-2 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="font-inter text-[14px] flex justify-between pt-5">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-brand-bg-100 text-black py-[16px] px-[35px] rounded-2xl border border-gray-200 hover:bg-brand-shadow cursor-pointer"
            >
              Next
            </button>
            <button className="bg-brand text-brand-white py-[16px] px-[35px] rounded-2xl border border-gray-200 hover:bg-orange-300 cursor-pointer">
              Save information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
