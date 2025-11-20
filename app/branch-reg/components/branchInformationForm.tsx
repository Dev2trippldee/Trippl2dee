"use client";

import { useState } from "react";
import { MapPin, ArrowLeft } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Link from "next/link";

interface BranchInformationFormProps {
  onSave: (data: any) => void;
}

export function BranchInformationForm({ onSave }: BranchInformationFormProps) {
  const [formData, setFormData] = useState({
    branchName: "",
    branchType: "",
    address: "",
    pinCode: "",
    phone: "",
    email: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate backend save with dummy data
    console.log("Branch information form submitted:", formData);
    // Call onSave callback to move to next step
    onSave(formData);
  };

  return (
    <div className="bg-white w-full rounded-[22px] p-3 md:p-5 shadow-md border border-orange-200">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-brand" />
        <h1 className="text-[19px] md:text-[24px] font-semibold text-brand">
          Branch Information
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Branch Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="branchName" className="text-[13px] font-medium text-gray-700">
            Branch Name
          </label>
          <input
            type="text"
            id="branchName"
            name="branchName"
            value={formData.branchName}
            onChange={handleInputChange}
            placeholder="Enter branch name"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Branch Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="branchType" className="text-[13px] font-medium text-gray-700">
            Branch Type
          </label>
          <select
            id="branchType"
            name="branchType"
            value={formData.branchType}
            onChange={handleInputChange}
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Select branch type</option>
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="fast-food">Fast Food</option>
            <option value="fine-dining">Fine Dining</option>
          </select>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-[13px] font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter complete address"
            className="bg-brand-bg-200 rounded-lg w-full border border-gray-200 p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Map Section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Choose your location in map
          </label>
          <div className="relative w-full h-[240px] md:h-[280px] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-brand mx-auto mb-2" />
                <p className="text-gray-600 text-[11px] font-medium">Click to select location</p>
              </div>
            </div>
            
            {/* Map Controls */}
            <div className="absolute top-2 right-2">
              <button
                type="button"
                className="bg-white text-brand px-3 py-1.5 rounded-lg text-[11px] font-medium shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              >
                Map
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
              <div className="w-2.5 h-2.5 bg-brand rounded-full mx-auto"></div>
              <button
                type="button"
                className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
              >
                <span className="text-base font-semibold leading-none">+</span>
              </button>
              <button
                type="button"
                className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
              >
                <span className="text-base font-semibold leading-none">−</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pin Code */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pinCode" className="text-[13px] font-medium text-gray-700">
            Pin code
          </label>
          <input
            type="text"
            id="pinCode"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleInputChange}
            placeholder="12345"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-[13px] font-medium text-gray-700">
            Phone Number
          </label>
          <PhoneInput
            value={formData.phone}
            onChange={handlePhoneChange}
            defaultCountry="in"
            inputProps={{ placeholder: "Enter your Mobile no" }}
            inputStyle={{
              width: "100%",
              height: "40px",
              borderRadius: "0px 10px 10px 0px",
              background: "#ffedd8",
              border: "1px solid #e5e7eb",
              paddingLeft: "10px",
              fontSize: "13px",
            }}
            countrySelectorStyleProps={{
              buttonStyle: {
                height: "40px",
                borderRadius: "10px 0px 0px 10px",
                border: "1px solid #e5e7eb",
                borderRight: "none",
              },
            }}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your Email"
            className="bg-brand-bg-200 rounded-lg w-full h-[40px] border border-gray-200 px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 pt-3 justify-between">
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            type="submit"
            className="flex items-center justify-center bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

