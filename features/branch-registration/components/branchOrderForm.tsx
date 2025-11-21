"use client";

import { Checkbox, Progress, Switch } from "@ark-ui/react";
import { 
  CheckIcon, 
  Plus, 
  Trash2, 
  Truck, 
  Package, 
  Calendar, 
  UtensilsCrossed,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { BranchRegFormProps } from "@/app/branch-registration/page";

export function BranchOrderForm({ setStep }: BranchRegFormProps) {
  const items = [
    { label: "Delivery", value: "Delivery", icon: Truck },
    { label: "Takeaway", value: "Takeaway", icon: Package },
    { label: "Reservations", value: "Reservations", icon: Calendar },
    { label: "Dining", value: "Dining", icon: UtensilsCrossed },
  ];

  const [selectedOrders, setSelectedOrders] = useState<string[]>(["Delivery", "Takeaway"]);
  const [onlinePayment, setOnlinePayment] = useState(true);
  const [offlinePayment, setOfflinePayment] = useState(true);
  const [advanceAmount, setAdvanceAmount] = useState("0.00");
  const [reservationCleaningTime, setReservationCleaningTime] = useState("00:15:00");
  const [deliveryRadius, setDeliveryRadius] = useState("5");
  const [kilometrePrice, setKilometrePrice] = useState("10.00");
  const [diningCleaningTime, setDiningCleaningTime] = useState("00:15:00");
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");

  type Charges = {
    id: string;
    label: string;
    amount: string;
  };

  const [codCharges, setCodCharges] = useState<Charges[]>([
    {
      id: "1",
      label: "",
      amount: "120.00",
    },
    {
      id: "2",
      label: "",
      amount: "0.00",
    },
  ]);

  const [copCharges, setCopCharges] = useState<Charges[]>([
    {
      id: "1",
      label: "",
      amount: "120.00",
    },
    {
      id: "2",
      label: "",
      amount: "0.00",
    },
  ]);

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  function changeCOD(
    id: string,
    key: "amount" | "label",
    value: string,
    flag: "cod" | "cop",
  ) {
    switch (flag) {
      case "cod":
        const updatedCOD = codCharges.map(charge => 
          charge.id === id ? { ...charge, [key]: value } : charge
        );
        setCodCharges(updatedCOD);
        break;
      case "cop":
        const updatedCOP = copCharges.map(charge => 
          charge.id === id ? { ...charge, [key]: value } : charge
        );
        setCopCharges(updatedCOP);
        break;
    }
  }

  function deleteCodCharge(
    id: string,
    event: React.MouseEvent<HTMLButtonElement>,
    flag: "cod" | "cop",
  ) {
    event.preventDefault();
    switch (flag) {
      case "cod":
        setCodCharges(codCharges.filter(charge => charge.id !== id));
        break;
      case "cop":
        setCopCharges(copCharges.filter(charge => charge.id !== id));
        break;
    }
  }

  function codAddCharges(
    event: React.MouseEvent<HTMLButtonElement>,
    flag: "cod" | "cop",
  ) {
    event.preventDefault();
    const newId = Date.now().toString();
    switch (flag) {
      case "cod":
        setCodCharges([...codCharges, { id: newId, label: "", amount: "0.00" }]);
        break;
      case "cop":
        setCopCharges([...copCharges, { id: newId, label: "", amount: "0.00" }]);
        break;
    }
  }

  const toggleOrderOption = (value: string) => {
    if (selectedOrders.includes(value)) {
      setSelectedOrders(selectedOrders.filter(item => item !== value));
    } else {
      setSelectedOrders([...selectedOrders, value]);
    }
  };

  const totalCodCharge = codCharges.reduce(
    (total, curr) => total + Number(curr.amount || 0),
    0,
  );

  const totalCopCharge = copCharges.reduce(
    (total, curr) => total + Number(curr.amount || 0),
    0,
  );

  return (
    <div className="bg-brand-white flex-4 font-fira rounded-3xl overflow-clip">
      {/* Progress bar */}
      <Progress.Root value={75} className="w-full">
        <Progress.Track className="rounded-2xl">
          <Progress.Range className="bg-teal-400 h-3" />
        </Progress.Track>
        <Progress.ValueText className="pl-[73%]" />
      </Progress.Root>

      <div className="p-[30px] font-fira">
        <form action="" className="w-full space-y-[30px]">
          {/* Order Options Available */}
          <div className="space-y-[15px]">
            <h3 className="text-brand text-[18px] md:text-[20px] font-semibold">
              Order Options Available
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedOrders.includes(item.value);
                return (
                  <div
                    key={item.value}
                    onClick={() => toggleOrderOption(item.value)}
                    className={`relative p-4 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        isSelected ? "bg-[#FFEBD4]" : "bg-gray-100"
                      }`}>
                        <Icon 
                          size={28} 
                          className={isSelected ? "text-brand" : "text-gray-400"} 
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        isSelected ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-brand rounded-full p-1">
                        <CheckIcon size={14} className="text-white" />
                      </div>
                    )}
                    {!isSelected && (
                      <div className="absolute top-2 right-2 bg-gray-300 rounded-full p-1">
                        <CheckIcon size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Options Available */}
          <div className="space-y-[15px]">
            <h3 className="text-brand text-[18px] md:text-[20px] font-semibold">
              Payment Options Available
            </h3>
            <div className="flex flex-col gap-4">
              <Switch.Root 
                checked={onlinePayment}
                onCheckedChange={(details) => setOnlinePayment(details.checked as boolean)}
                className="inline-flex items-center justify-between gap-3 bg-white p-4 rounded-lg border border-gray-200"
              >
                <Switch.Label className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                  Online (Prepaid)
                </Switch.Label>
                <Switch.Control className="relative w-11 h-6 bg-gray-300 rounded-full flex items-center transition-colors duration-200 ease-in-out data-[state=checked]:bg-brand cursor-pointer">
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out translate-x-0.5 data-[state=checked]:translate-x-5" />
                </Switch.Control>
                <Switch.HiddenInput />
              </Switch.Root>
              <Switch.Root 
                checked={offlinePayment}
                onCheckedChange={(details) => setOfflinePayment(details.checked as boolean)}
                className="inline-flex items-center justify-between gap-3 bg-white p-4 rounded-lg border border-gray-200"
              >
                <Switch.Label className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                  Offline (COD/COP)
                </Switch.Label>
                <Switch.Control className="relative w-11 h-6 bg-gray-300 rounded-full flex items-center transition-colors duration-200 ease-in-out data-[state=checked]:bg-brand cursor-pointer">
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out translate-x-0.5 data-[state=checked]:translate-x-5" />
                </Switch.Control>
                <Switch.HiddenInput />
              </Switch.Root>
            </div>
          </div>

          {/* Reservation */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-[15px]">
            <h3 className="text-brand text-[18px] md:text-[20px] font-semibold">
              Reservation
            </h3>
            <div className="flex flex-col gap-[12px]">
              <label htmlFor="advance-amount" className="text-[16px] font-medium text-gray-700">
                Advance Amount
              </label>
              <input
                type="text"
                id="advance-amount"
                value={`₹${advanceAmount}`}
                onChange={(e) => setAdvanceAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="flex flex-col gap-[12px]">
              <label htmlFor="reservation-cleaning-time" className="text-[16px] font-medium text-gray-700">
                Cleaning Time
              </label>
              <input
                type="text"
                id="reservation-cleaning-time"
                value={reservationCleaningTime}
                onChange={(e) => setReservationCleaningTime(e.target.value)}
                className="bg-[#FFF8F3] text-brand font-medium pl-4 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-[15px]">
            <h3 className="text-brand text-[18px] md:text-[20px] font-semibold">
              Delivery
            </h3>
            <div className="flex flex-col gap-[12px]">
              <label htmlFor="delivery-radius" className="text-[16px] font-medium text-gray-700">
                Available KM (Delivery Radius)
              </label>
              <input
                type="text"
                id="delivery-radius"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(e.target.value)}
                className="bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="flex flex-col gap-[12px]">
              <label htmlFor="kilometre-price" className="text-[16px] font-medium text-gray-700">
                Kilometre Price
              </label>
              <input
                type="text"
                id="kilometre-price"
                value={`₹ ${kilometrePrice}`}
                onChange={(e) => setKilometrePrice(e.target.value.replace(/[^0-9.]/g, ""))}
                className="bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            
            {/* COD Extra Charges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-gray-700">COD Extra Charges</span>
              </div>
              <div className="flex flex-col gap-3">
                <select
                  value={selectedPaymentOption}
                  onChange={(e) => setSelectedPaymentOption(e.target.value)}
                  className="bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Choose Payment option</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="prepaid">Prepaid</option>
                </select>
                <div className="space-y-2">
                  {codCharges.map((charge) => (
                    <div key={charge.id} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={charge.label}
                        onChange={(e) => changeCOD(charge.id, "label", e.target.value, "cod")}
                        placeholder="Handling Charges"
                        className="flex-1 bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <input
                        type="text"
                        value={`₹ ${charge.amount}`}
                        onChange={(e) => changeCOD(charge.id, "amount", e.target.value.replace(/[^0-9.]/g, ""), "cod")}
                        className="flex-1 bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <button
                        type="button"
                        onClick={(e) => deleteCodCharge(charge.id, e, "cod")}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => codAddCharges(e, "cod")}
                  className="flex items-center gap-2 justify-center rounded-lg bg-brand-bg-100 border border-brand text-brand p-2 hover:bg-brand-shadow transition-colors"
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">Add Changes</span>
                </button>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[16px] font-medium text-gray-700">Total Extra Charges:</span>
                  <span className="text-brand font-semibold text-[16px]">
                    {inrFormatter.format(totalCodCharge)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/*COD Extra Charges*/}
          <div className="bg-brand-shadow p-5 rounded-xl space-y-5">
            <div className="flex justify-between items-center text-md">
              <span className="">COD Extra Charges</span>
              <button
                onClick={(e) => codAddCharges(e, "cod")}
                className="flex gap-2 justify-center items-center rounded-3xl bg-brand-bg-100 border text-sm  border-brand p-2"
              >
                <Plus size={15} /> Add Changes
              </button>
            </div>
            <div>
              <ul className="space-y-2">
                {codCharges.map((cod, idx) => (
                  <li className="flex gap-3" key={cod.id}>
                    <input
                      onChange={(e) =>
                        changeCOD(cod.id, "label", e.target.value, "cod")
                      }
                      value={cod.label}
                      type="text"
                      className="bg-white pl-4 py-2 text-brand rounded-2xl flex-6 border border-gray-300"
                      placeholder="Type of Charge"
                    />
                    <input
                      value={cod.amount}
                      onChange={(e) =>
                        changeCOD(cod.id, "amount", e.target.value, "cod")
                      }
                      type="number"
                      className="flex-2 bg-white pl-4 py-2 text-brand rounded-2xl border border-gray-300"
                      placeholder="Amount"
                    />
                    <button
                      className="flex-1 center-div text-brand cursor-pointer"
                      onClick={(e) => deleteCodCharge(cod.id, e, "cod")}
                    >
                      <Trash2 />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between">
              <span>Total Extra Charges</span>
              <span className="text-brand">
                {inrFormatter.format(totalCodCharge)}
              </span>
            </div>
          </div>

          {/* Dining */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-[15px]">
            <h3 className="text-brand text-[18px] md:text-[20px] font-semibold">
              Dining
            </h3>
            <div className="flex flex-col gap-[12px]">
              <label htmlFor="dining-cleaning-time" className="text-[16px] font-medium text-gray-700">
                Cleaning Time
              </label>
              <input
                type="text"
                id="dining-cleaning-time"
                value={diningCleaningTime}
                onChange={(e) => setDiningCleaningTime(e.target.value)}
                className="bg-[#FFF8F3] text-brand font-medium pl-4 rounded-lg w-full h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {/* Takeaway */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-[15px]">
            <h3 className="text-brand text-[18px] md:text-[20px] font-semibold">
              Takeaway
            </h3>
            
            {/* COP Extra Charges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-medium text-gray-700">COP Extra Charges</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  {copCharges.map((charge) => (
                    <div key={charge.id} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={charge.label}
                        onChange={(e) => changeCOD(charge.id, "label", e.target.value, "cop")}
                        placeholder="Handling Charges"
                        className="flex-1 bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <input
                        type="text"
                        value={`₹ ${charge.amount}`}
                        onChange={(e) => changeCOD(charge.id, "amount", e.target.value.replace(/[^0-9.]/g, ""), "cop")}
                        className="flex-1 bg-[#FFF8F3] text-gray-800 pl-4 rounded-lg h-[50px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <button
                        type="button"
                        onClick={(e) => deleteCodCharge(charge.id, e, "cop")}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => codAddCharges(e, "cop")}
                  className="flex items-center gap-2 justify-center rounded-lg bg-brand-bg-100 border border-brand text-brand p-2 hover:bg-brand-shadow transition-colors"
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">Add Changes</span>
                </button>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[16px] font-medium text-gray-700">Total Extra Charges:</span>
                  <span className="text-brand font-semibold text-[16px]">
                    {inrFormatter.format(totalCopCharge)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-5 gap-4">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex items-center gap-2 bg-brand text-white py-[16px] px-[35px] rounded-xl hover:bg-orange-600 transition-colors cursor-pointer font-medium"
            >
              <ArrowLeft size={18} />
              <span>Previous</span>
            </button>
            <button
              type="submit"
              className="bg-brand text-white py-[16px] px-[35px] rounded-xl hover:bg-orange-600 transition-colors cursor-pointer font-medium"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
