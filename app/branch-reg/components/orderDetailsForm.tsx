"use client";

import { useState } from "react";
import { Building2, ArrowLeft, Plus, Trash2 } from "lucide-react";

interface OrderDetailsFormProps {
  onPrevious?: () => void;
  onSave?: (data: any) => void;
}

type OrderOption = "delivery" | "takeaway" | "reservations" | "dining";
type PaymentOption = "online" | "offline";

export function OrderDetailsForm({ 
  onPrevious = () => {}, 
  onSave = () => {} 
}: OrderDetailsFormProps) {
  const [formData, setFormData] = useState({
    cuisine: "",
    category: "",
    description: "",
    orderOptions: {
      delivery: false,
      takeaway: false,
      reservations: false,
      dining: false,
    },
    paymentOptions: {
      online: false,
      offline: false,
    },
    reservation: {
      advanceAmount: "₹0.00",
      cleaningTime: "00:15:00",
    },
    delivery: {
      availableKm: "5",
      kilometrePrice: "₹10.00",
      codExtraCharges: [
        { name: "Handling Charges", amount: "₹120.00" },
        { name: "Handling Charges", amount: "₹0.00" },
      ],
      totalExtraCharges: "₹120.00",
    },
    dining: {
      cleaningTime: "00:15:00",
    },
    takeaway: {
      copExtraCharges: [
        { name: "Handling Charges", amount: "₹120.00" },
        { name: "Handling Charges", amount: "₹0.00" },
      ],
      totalExtraCharges: "₹120.00",
    },
    operatingHours: {
      monday: { open: "", close: "" },
      tuesday: { open: "", close: "" },
      wednesday: { open: "", close: "" },
      thursday: { open: "", close: "" },
      friday: { open: "", close: "" },
      saturday: { open: "", close: "" },
      sunday: { open: "", close: "" },
    },
  });

  const cuisines = [
    "North Indian",
    "South Indian",
    "Chinese",
    "Italian",
    "Continental",
    "Fast Food",
    "Beverages",
    "Desserts",
  ];

  const categories = ["Veg", "Non-Veg", "Both"];

  const handleOrderOptionChange = (option: OrderOption) => {
    setFormData((prev) => ({
      ...prev,
      orderOptions: {
        ...prev.orderOptions,
        [option]: !prev.orderOptions[option],
      },
    }));
  };

  const handlePaymentOptionChange = (option: PaymentOption) => {
    setFormData((prev) => ({
      ...prev,
      paymentOptions: {
        ...prev.paymentOptions,
        [option]: !prev.paymentOptions[option],
      },
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Order details form submitted:", formData);
    onSave(formData);
  };

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="bg-white w-full rounded-[22px] p-5 shadow-md border border-orange-200 space-y-5">
      {/* Order Options Available */}
      <div className="border border-orange-200 rounded-[14px] p-4">
        <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
          Order Options Available
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {(["delivery", "takeaway", "reservations", "dining"] as OrderOption[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleOrderOptionChange(option)}
              className={`flex flex-col items-center justify-center p-4 rounded-[12px] border-2 transition-colors relative ${
                formData.orderOptions[option]
                  ? "border-orange-500 bg-orange-50"
                  : "border-orange-200 bg-white"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold mb-2">
                {option === "delivery" && "🚗"}
                {option === "takeaway" && "📦"}
                {option === "reservations" && "📅"}
                {option === "dining" && "🍽"}
              </div>
              <span className="text-[12px] font-medium text-gray-700 capitalize">
                {option}
              </span>
              {formData.orderOptions[option] && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Options Available */}
      <div className="border border-orange-200 rounded-[14px] p-4">
        <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
          Payment Options Available
        </h2>
        <div className="flex gap-4">
          {(["online", "offline"] as PaymentOption[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handlePaymentOptionChange(option)}
              className="flex items-center justify-between flex-1 p-3 border-2 border-orange-200 rounded-[12px] hover:border-orange-400 transition-colors"
            >
              <span className="text-[13px] font-medium text-gray-700">
                {option === "online" ? "Online (Prepaid)" : "Offline (COD/UPI)"}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.paymentOptions[option]
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {formData.paymentOptions[option] && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reservation */}
      <div className="border border-orange-200 rounded-[14px] p-4">
        <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
          Reservation
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-gray-700 block mb-2">
              Advance Amount
            </label>
            <input
              type="text"
              value={formData.reservation.advanceAmount}
              className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-700 block mb-2">
              Cleaning Time
            </label>
            <input
              type="time"
              value={formData.reservation.cleaningTime}
              className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="border border-orange-200 rounded-[14px] p-4">
        <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
          Delivery
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[12px] font-medium text-gray-700 block mb-2">
              Available KM (Delivery Radius)
            </label>
            <input
              type="text"
              value={formData.delivery.availableKm}
              className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-gray-700 block mb-2">
              Kilometre Price
            </label>
            <input
              type="text"
              value={formData.delivery.kilometrePrice}
              className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* COD Extra Charges */}
        <div className="bg-orange-50 rounded-[12px] p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[12px] font-medium text-gray-700">
              COD Extra Charges
            </label>
            <button
              type="button"
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-[12px]"
            >
              <Plus className="w-4 h-4" /> Add Charges
            </button>
          </div>
          {formData.delivery.codExtraCharges.map((charge, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select className="flex-1 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none">
                <option>Choose Payment option</option>
              </select>
              <input
                type="text"
                placeholder="Handling Charges"
                value={charge.name}
                className="flex-1 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
              />
              <input
                type="text"
                value={charge.amount}
                className="w-24 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
              />
              <button
                type="button"
                className="text-orange-500 hover:text-orange-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-orange-200">
            <span className="text-[12px] font-medium text-gray-700">
              Total Extra Charges:
            </span>
            <span className="text-[13px] font-semibold text-orange-500">
              {formData.delivery.totalExtraCharges}
            </span>
          </div>
        </div>
      </div>

      {/* Dining */}
      <div className="border border-orange-200 rounded-[14px] p-4">
        <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
          Dining
        </h2>
        <div>
          <label className="text-[12px] font-medium text-gray-700 block mb-2">
            Cleaning Time
          </label>
          <input
            type="time"
            value={formData.dining.cleaningTime}
            className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Takeaway */}
      <div className="border border-orange-200 rounded-[14px] p-4">
        <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
          Takeaway
        </h2>
        <div className="bg-orange-50 rounded-[12px] p-3">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[12px] font-medium text-gray-700">
              COP Extra Charges
            </label>
            <button
              type="button"
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-[12px]"
            >
              <Plus className="w-4 h-4" /> Add Charges
            </button>
          </div>
          {formData.takeaway.copExtraCharges.map((charge, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Handling Charges"
                value={charge.name}
                className="flex-1 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
              />
              <input
                type="text"
                value={charge.amount}
                className="w-24 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
              />
              <button
                type="button"
                className="text-orange-500 hover:text-orange-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-orange-200">
            <span className="text-[12px] font-medium text-gray-700">
              Total Extra Charges:
            </span>
            <span className="text-[13px] font-semibold text-orange-500">
              {formData.takeaway.totalExtraCharges}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row gap-3 pt-3 justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex items-center justify-center bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px]"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}


