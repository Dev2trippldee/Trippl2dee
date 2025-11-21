"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createOrUpdateEateryOrderOptions } from "@/lib/api/eatery";
import type { ExtraCharge } from "@/lib/api/eatery";

interface OrderDetailsFormProps {
  onPrevious?: () => void;
  onSave?: (data: any) => void;
  eateryAlias?: string;
}

type OrderOption = "delivery" | "pick_up" | "reservation" | "dining";
type PaymentOption = "online" | "offline";
type PaymentType = "online" | "offline";

interface ExtraChargeItem {
  type: string;
  amount: string;
  paymentType: PaymentType;
}

export function OrderDetailsForm({ 
  onPrevious = () => {}, 
  onSave = () => {},
  eateryAlias = ""
}: OrderDetailsFormProps) {
  const [token, setToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    orderOptions: {
      delivery: false,
      pick_up: false,
      reservation: false,
      dining: false,
    },
    paymentOptions: {
      online: false,
      offline: false,
    },
    reservation: {
      advanceAmount: "",
      advancePercentage: "",
      cleaningTime: "00:15:00",
    },
    delivery: {
      availableRadius: "",
      chargesPerKm: "",
      extraCharges: [] as ExtraChargeItem[],
    },
    pick_up: {
      extraCharges: [] as ExtraChargeItem[],
    },
    dining: {
      cleaningTime: "00:15:00",
    },
  });

  // Get token from cookies API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/cookies/get-user-data");
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
        } else {
          console.warn("No token found in response");
          toast.error("Please login to continue");
        }
      } catch (error) {
        console.error("Failed to fetch token:", error);
        toast.error("Failed to authenticate");
      }
    };

    fetchToken();
  }, []);

  // Validate eateryAlias
  useEffect(() => {
    if (!eateryAlias) {
      toast.error("Eatery alias not found. Please complete previous steps first.");
    }
  }, [eateryAlias]);

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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const parts = name.split(".");

    if (parts.length === 2) {
      // Handle nested fields like reservation.advanceAmount
      setFormData((prev) => ({
        ...prev,
        [parts[0]]: {
          ...prev[parts[0] as keyof typeof prev],
          [parts[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addExtraCharge = (type: "delivery" | "pick_up") => {
    const newCharge: ExtraChargeItem = {
      type: "",
      amount: "",
      paymentType: "offline",
    };
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        extraCharges: [...prev[type].extraCharges, newCharge],
      },
    }));
  };

  const removeExtraCharge = (type: "delivery" | "pick_up", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        extraCharges: prev[type].extraCharges.filter((_, i) => i !== index),
      },
    }));
  };

  const updateExtraCharge = (
    type: "delivery" | "pick_up",
    index: number,
    field: keyof ExtraChargeItem,
    value: string | PaymentType
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        extraCharges: prev[type].extraCharges.map((charge, i) =>
          i === index ? { ...charge, [field]: value } : charge
        ),
      },
    }));
  };

  // Helper function to parse numeric value from string (removes currency symbols, commas, etc.)
  const parseNumericValue = (value: string): number => {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to format time to HH:MM:SS
  const formatTime = (time: string): string => {
    if (!time) return "00:15:00";
    // If time is in HH:MM format, convert to HH:MM:SS
    if (time.match(/^\d{2}:\d{2}$/)) {
      return `${time}:00`;
    }
    return time;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[OrderDetailsForm] Form submission started...");

    // Validation
    if (!eateryAlias) {
      console.error("[OrderDetailsForm] Validation failed: Eatery alias not found");
      toast.error("Eatery alias not found. Please complete previous steps first.");
      return;
    }

    const selectedOrderTypes = Object.entries(formData.orderOptions)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => {
        // Map UI keys to API keys
        if (key === "pick_up") return "pick_up";
        if (key === "reservation") return "reservation";
        return key; // delivery, dining
      });

    if (selectedOrderTypes.length === 0) {
      toast.error("Please select at least one order option");
      return;
    }

    const selectedPaymentOptions = Object.entries(formData.paymentOptions)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedPaymentOptions.length === 0) {
      toast.error("Please select at least one payment option");
      return;
    }

    if (!token) {
      console.error("[OrderDetailsForm] Validation failed: No authentication token");
      toast.error("Authentication token not found");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[OrderDetailsForm] Preparing data for submission...");

      // Build API request data
      const requestData: any = {
        eatery_alias: eateryAlias,
        step_name: "order_options",
        available_order_types: selectedOrderTypes,
        available_payment_options: selectedPaymentOptions,
      };

      // Add reservation data if selected
      if (formData.orderOptions.reservation) {
        requestData.reservation = {};
        if (formData.reservation.advanceAmount) {
          requestData.reservation.advance_amount = parseNumericValue(
            formData.reservation.advanceAmount
          );
        }
        if (formData.reservation.advancePercentage) {
          requestData.reservation.advance_percentage_of_order = parseNumericValue(
            formData.reservation.advancePercentage
          );
        }
        if (formData.reservation.cleaningTime) {
          requestData.reservation.cleaning_time = formatTime(
            formData.reservation.cleaningTime
          );
        }
      }

      // Add delivery data if selected
      if (formData.orderOptions.delivery) {
        requestData.delivery = {
          available_radius: parseNumericValue(formData.delivery.availableRadius),
          charges_per_km: parseNumericValue(formData.delivery.chargesPerKm),
        };

        // Process extra charges for delivery
        if (formData.delivery.extraCharges.length > 0) {
          requestData.delivery.extra_charges = {
            offline: [] as ExtraCharge[],
            online: [] as ExtraCharge[],
          };

          formData.delivery.extraCharges.forEach((charge) => {
            if (charge.type && charge.amount) {
              const amount = parseNumericValue(charge.amount);
              if (amount > 0) {
                const extraCharge: ExtraCharge = {
                  type: charge.type,
                  amount: amount,
                };
                if (charge.paymentType === "offline") {
                  requestData.delivery.extra_charges.offline!.push(extraCharge);
                } else {
                  requestData.delivery.extra_charges.online!.push(extraCharge);
                }
              }
            }
          });

          // Remove empty arrays
          if (requestData.delivery.extra_charges.offline!.length === 0) {
            delete requestData.delivery.extra_charges.offline;
          }
          if (requestData.delivery.extra_charges.online!.length === 0) {
            delete requestData.delivery.extra_charges.online;
          }

          // Remove extra_charges if both are empty
          if (
            !requestData.delivery.extra_charges.offline &&
            !requestData.delivery.extra_charges.online
          ) {
            delete requestData.delivery.extra_charges;
          }
        }
      }

      // Add pick_up data if selected
      if (formData.orderOptions.pick_up) {
        // Process extra charges for pick_up
        if (formData.pick_up.extraCharges.length > 0) {
          requestData.pick_up = {
            extra_charges: {
              offline: [] as ExtraCharge[],
              online: [] as ExtraCharge[],
            },
          };

          formData.pick_up.extraCharges.forEach((charge) => {
            if (charge.type && charge.amount) {
              const amount = parseNumericValue(charge.amount);
              if (amount > 0) {
                const extraCharge: ExtraCharge = {
                  type: charge.type,
                  amount: amount,
                };
                if (charge.paymentType === "offline") {
                  requestData.pick_up.extra_charges.offline!.push(extraCharge);
                } else {
                  requestData.pick_up.extra_charges.online!.push(extraCharge);
                }
              }
            }
          });

          // Remove empty arrays
          if (requestData.pick_up.extra_charges.offline!.length === 0) {
            delete requestData.pick_up.extra_charges.offline;
          }
          if (requestData.pick_up.extra_charges.online!.length === 0) {
            delete requestData.pick_up.extra_charges.online;
          }

          // Remove extra_charges if both are empty
          if (
            !requestData.pick_up.extra_charges.offline &&
            !requestData.pick_up.extra_charges.online
          ) {
            delete requestData.pick_up;
          }
        }
      }

      // Add dining data if selected
      if (formData.orderOptions.dining && formData.dining.cleaningTime) {
        requestData.dining = {
          cleaning_time: formatTime(formData.dining.cleaningTime),
        };
      }

      console.log("[OrderDetailsForm] Prepared submit data:", JSON.stringify(requestData, null, 2));
      const response = await createOrUpdateEateryOrderOptions(requestData, token);

      if (response.success && response.data) {
        toast.success(response.message || "Order options saved successfully!");
        onSave(response.data);
      } else {
        toast.error(response.message || "Failed to save order options");
      }
    } catch (error) {
      console.error("[OrderDetailsForm] Error submitting form:", error);
      toast.error("Failed to save order options");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white w-full rounded-[22px] p-5 shadow-md border border-orange-200 space-y-5">
      {/* Order Options Available */}
      <div className="border border-orange-200 rounded-[14px] p-4">
        <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
          Order Options Available
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {([
            { key: "delivery" as OrderOption, label: "Delivery", icon: "🚗" },
            { key: "pick_up" as OrderOption, label: "Take Away", icon: "📦" },
            { key: "reservation" as OrderOption, label: "Reservation", icon: "📅" },
            { key: "dining" as OrderOption, label: "Dining", icon: "🍽" },
          ]).map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleOrderOptionChange(key)}
              className={`flex flex-col items-center justify-center p-4 rounded-[12px] border-2 transition-colors relative ${
                formData.orderOptions[key]
                  ? "border-orange-500 bg-orange-50"
                  : "border-orange-200 bg-white"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold mb-2">
                {icon}
              </div>
              <span className="text-[12px] font-medium text-gray-700">
                {label}
              </span>
              {formData.orderOptions[key] && (
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
      {formData.orderOptions.reservation && (
        <div className="border border-orange-200 rounded-[14px] p-4">
          <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
            Reservation
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-2">
                Advance Amount
              </label>
              <input
                type="number"
                name="reservation.advanceAmount"
                value={formData.reservation.advanceAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-2">
                Advance % of Order
              </label>
              <input
                type="number"
                name="reservation.advancePercentage"
                value={formData.reservation.advancePercentage}
                onChange={handleInputChange}
                placeholder="0"
                step="1"
                min="0"
                max="100"
                className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-2">
                Cleaning Time
              </label>
              <input
                type="time"
                name="reservation.cleaningTime"
                value={formData.reservation.cleaningTime}
                onChange={handleInputChange}
                className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delivery */}
      {formData.orderOptions.delivery && (
        <div className="border border-orange-200 rounded-[14px] p-4">
          <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
            Delivery
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-2">
                Available Radius (KM)
              </label>
              <input
                type="number"
                name="delivery.availableRadius"
                value={formData.delivery.availableRadius}
                onChange={handleInputChange}
                placeholder="10"
                step="0.1"
                min="0"
                className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-2">
                Charges Per KM
              </label>
              <input
                type="number"
                name="delivery.chargesPerKm"
                value={formData.delivery.chargesPerKm}
                onChange={handleInputChange}
                placeholder="29.9"
                step="0.1"
                min="0"
                className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Extra Charges */}
          <div className="bg-orange-50 rounded-[12px] p-3 mb-3">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[12px] font-medium text-gray-700">
                Extra Charges
              </label>
              <button
                type="button"
                onClick={() => addExtraCharge("delivery")}
                className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-[12px]"
              >
                <Plus className="w-4 h-4" /> Add Charge
              </button>
            </div>
            {formData.delivery.extraCharges.map((charge, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={charge.paymentType}
                  onChange={(e) =>
                    updateExtraCharge("delivery", idx, "paymentType", e.target.value as PaymentType)
                  }
                  className="flex-1 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
                <input
                  type="text"
                  placeholder="Charge Type (e.g., Handling Charge)"
                  value={charge.type}
                  onChange={(e) =>
                    updateExtraCharge("delivery", idx, "type", e.target.value)
                  }
                  className="flex-1 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={charge.amount}
                  onChange={(e) =>
                    updateExtraCharge("delivery", idx, "amount", e.target.value)
                  }
                  step="0.01"
                  min="0"
                  className="w-24 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeExtraCharge("delivery", idx)}
                  className="text-orange-500 hover:text-orange-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dining */}
      {formData.orderOptions.dining && (
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
              name="dining.cleaningTime"
              value={formData.dining.cleaningTime}
              onChange={handleInputChange}
              className="w-full h-[40px] bg-orange-50 border border-orange-200 rounded-lg px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}

      {/* Takeaway (Pick Up) */}
      {formData.orderOptions.pick_up && (
        <div className="border border-orange-200 rounded-[14px] p-4">
          <h2 className="text-[15px] font-semibold text-orange-500 mb-4">
            Take Away
          </h2>
          <div className="bg-orange-50 rounded-[12px] p-3">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[12px] font-medium text-gray-700">
                Extra Charges
              </label>
              <button
                type="button"
                onClick={() => addExtraCharge("pick_up")}
                className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-[12px]"
              >
                <Plus className="w-4 h-4" /> Add Charge
              </button>
            </div>
            {formData.pick_up.extraCharges.map((charge, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={charge.paymentType}
                  onChange={(e) =>
                    updateExtraCharge("pick_up", idx, "paymentType", e.target.value as PaymentType)
                  }
                  className="flex-1 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
                <input
                  type="text"
                  placeholder="Charge Type (e.g., Handling Charge)"
                  value={charge.type}
                  onChange={(e) =>
                    updateExtraCharge("pick_up", idx, "type", e.target.value)
                  }
                  className="flex-1 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={charge.amount}
                  onChange={(e) =>
                    updateExtraCharge("pick_up", idx, "amount", e.target.value)
                  }
                  step="0.01"
                  min="0"
                  className="w-24 h-[32px] bg-white border border-orange-200 rounded-lg px-2 text-[12px] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeExtraCharge("pick_up", idx)}
                  className="text-orange-500 hover:text-orange-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-row gap-3 pt-3 justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-brand text-white font-medium rounded-xl px-6 py-3 hover:bg-orange-600 transition-colors shadow-md text-[13px] md:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Continue"
          )}
        </button>
      </div>
    </form>
  );
}