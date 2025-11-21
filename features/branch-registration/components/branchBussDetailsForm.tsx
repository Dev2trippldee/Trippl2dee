"use client";
import {
  Checkbox,
  FileUpload,
  RadioGroup,
  Switch,
} from "@ark-ui/react";
import {
  CheckIcon,
  CreditCard,
  FileText,
  ImageIcon,
  MapPinned,
  Palette,
  Upload,
  Car,
  Wifi,
  Eye,
  Landmark,
  Lock,
  Building2,
  Toilet,
  Snowflake,
  GlassWater,
  Home,
  Gamepad2,
  Waves,
  Sparkle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Clock10,
  Copy,
  ClockFading,
  Gift,
} from "lucide-react";
import React, { useState } from "react";
import TimePicker from "rsuite/TimePicker";

import "rsuite/TimePicker/styles/index.css";

export function BranchBussDetailsForm() {
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

  const amenities = [
    { label: "Car Parking", icon: <Car size={22} /> },
    { label: "WiFi", icon: <Wifi size={22} /> },
    { label: "Road Side View", icon: <Eye size={22} /> },
    { label: "Sightseeing", icon: <Landmark size={22} /> },
    { label: "Private Dining", icon: <Lock size={22} /> },
    { label: "Balcony", icon: <Building2 size={22} /> },
    { label: "Toilet", icon: <Toilet size={22} /> },
    { label: "A/C", icon: <Snowflake size={22} /> },
    { label: "Bar", icon: <GlassWater size={22} /> },
    { label: "Rooftop", icon: <Home size={22} /> },
    { label: "Kids Games", icon: <Gamepad2 size={22} /> },
    { label: "Poolside", icon: <Waves size={22} /> },
  ];
  const category = ["Veg", "Non-Veg"];
  type TableSetupItem = {
    tableName: string;
    capacity: number;
  };

  const tableSetupInitialData: TableSetupItem = {
    tableName: "VIP Room table 1",
    capacity: 3,
  };

  const today = new Date();
  const midnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
  );

  type OperatingHours = {
    [key in
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday"]: {
      openingTime: Date;
      closingTime: Date;
    };
  };

  const operatingHrsInitialData = {
    Monday: {
      openingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        10,
        1,
      ),
      closingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        16,
        1,
      ),
    },
    Tuesday: {
      openingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
      closingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
    },
    Wednesday: {
      openingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
      closingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
    },
    Thursday: {
      openingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
      closingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
    },
    Friday: {
      openingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
      closingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
    },
    Saturday: {
      openingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
      closingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
    },
    Sunday: {
      openingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
      closingTime: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
      ),
    },
  };

  const [tableSetup, setTableSetup] = useState<TableSetupItem[]>([
    tableSetupInitialData,
  ]);
  const [selected, setSelected] = useState<string[]>(["North Indian"]);

  const [operatingHrs, setOperatingHrs] = useState<OperatingHours>(
    operatingHrsInitialData,
  );

  const [isMondayTimingsChecked, setIsMondayTimingsChecked] = useState(false);

  // Table
  function changeTableHandler(
    idx: number,
    label: "tableName" | "capacity",
    value: string | number,
  ) {
    const updated = [...tableSetup];
    if (label == "tableName" && typeof value == "string") {
      updated[idx][label] = value;
    } else if (label == "capacity" && typeof value == "number") {
      updated[idx][label] = value;
    }
    setTableSetup(updated);
  }

  function delTableHandler(idx: number) {
    const updated = [...tableSetup];
    updated.splice(idx, 1);
    setTableSetup(updated);
  }

  function addTableHandler() {
    const updated = [...tableSetup];
    updated.push({
      tableName: "",
      capacity: 1,
    });
    setTableSetup(updated);
  }
  // Table

  // Operating Hours

  function changeOperatingHours(
    day:
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday",
    label: "openingTime" | "closingTime",
    time: Date,
  ) {
    const updated = { ...operatingHrs };
    updated[day][label] = time;
    setOperatingHrs(updated);
  }

  function mondayCloneTiming() {
    if (isMondayTimingsChecked) {
      const mondayOpTime = operatingHrs["Monday"].openingTime;
      const mondayCloTime = operatingHrs["Monday"].closingTime;
      const updated = { ...operatingHrs };
      Object.keys(operatingHrs).forEach((day: string) => {
        updated[day as keyof typeof operatingHrs].openingTime = mondayOpTime;
        updated[day as keyof typeof operatingHrs].closingTime = mondayCloTime;
      });
      setOperatingHrs(updated);
    }
  }

  return (
    <div className="bg-brand-white flex-4 font-fira rounded-3xl overflow-clip ">
      <div className="p-[30px] font-fira">
        <form action="" className="w-full space-y-[20px]">
       
          {/*UPI*/}
          <div className="flex flex-col gap-[15px] font-fira">
            <label htmlFor="upi-id" className="text-[18px]">
              UPI ID
            </label>

            <div className="flex items-center bg-[#FFFAF5] border border-gray-200 rounded-xl h-[50px] px-3 focus-within:ring-2 focus-within:ring-brand">
              <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="text"
                id="upi-id"
                name="upi-id"
                placeholder="merchant@upi"
                className="bg-transparent w-full focus:outline-none text-[16px] text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/*Category*/}
          <RadioGroup.Root
            onValueChange={(details) => console.log(details)}
            className="relative flex flex-col gap-4 font-fira "
          >
            <RadioGroup.Label className="text-[18px] mr-4">
              Category
            </RadioGroup.Label>

            <div className="flex flex-wrap gap-5">
              {category.map((cat) => (
                <RadioGroup.Item
                  key={cat}
                  value={cat}
                  className="inline-flex items-center gap-2 relative z-[2] cursor-pointer disabled:cursor-not-allowed"
                >
                  <RadioGroup.ItemControl
                    className="h-5 w-5 rounded-full border-2 border-gray-400 bg-gray-100 flex items-center justify-center
                         data-[hover]:bg-gray-300
                         data-[state=checked]:bg-brand data-[state=checked]:border-gray-600 data-[state=checked]:border-[2px]
                         transition-all duration-50 "
                  >
                    <RadioGroup.Indicator />
                  </RadioGroup.ItemControl>

                  <RadioGroup.ItemText className="text-[16px] select-none">
                    {cat}
                  </RadioGroup.ItemText>

                  <RadioGroup.ItemHiddenInput />
                </RadioGroup.Item>
              ))}
            </div>
          </RadioGroup.Root>

          {/*Cuisine*/}
          <div className="flex flex-col gap-5 font-fira">
            <h3 className="text-[22px] font-semibold text-brand">Cuisines</h3>
            {/* Cuisines List */}
            <Checkbox.Group
              value={selected}
              onValueChange={setSelected}
              className="grid grid-cols-2 gap-3"
            >
              {cuisines.map((cuisine) => (
                <Checkbox.Root
                  key={cuisine}
                  value={cuisine}
                  className="w-full bg-brand-bg-100 border border-brand rounded-lg flex justify-start items-center p-3 gap-3 cursor-pointer
                  "
                >
                  {/* Control */}
                  <Checkbox.Control className="w-[20px] h-[20px] border-2 border-brand rounded-md flex items-center justify-center">
                    <Checkbox.Indicator>
                      <div className="bg-brand rounded-sm text-white p-[2px]">
                        <CheckIcon size={14} />
                      </div>
                    </Checkbox.Indicator>
                  </Checkbox.Control>

                  {/* Label */}
                  <Checkbox.Label className="text-[16px] text-gray-800">
                    {cuisine}
                  </Checkbox.Label>

                  <Checkbox.HiddenInput />
                </Checkbox.Root>
              ))}
            </Checkbox.Group>

            {/*Delivery Available*/}
            <Switch.Root className="flex items-center justify-between gap-3 bg-brand-bg-100 p-4 rounded-lg border border-gray-300">
              <Switch.Label className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                Delivery Available
              </Switch.Label>
              <Switch.Control className="relative w-11 h-6 bg-gray-300 rounded-full flex items-center transition-colors duration-200 ease-in-out data-[state=checked]:bg-orange-500 cursor-pointer">
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out translate-x-0.5 data-[state=checked]:translate-x-5" />
              </Switch.Control>
              <Switch.HiddenInput />
            </Switch.Root>
          </div>

          {/*Brand Profile  */}
          <div className="bg-brand-white font-fira rounded-3xl overflow-clip w-full pt-3">
            {/* Header */}
            <div className="text-brand flex justify-start gap-3 items-center pb-[20px]">
              <Palette className="w-[36px]" />
              <h3 className="font-inter text-[28px] font-semibold">
                Brand Profile
              </h3>
            </div>

            {/* Profile Photo Section */}
            <div className="flex flex-col gap-[15px]">
              <label className="text-[18px]">Profile Photo</label>

              <FileUpload.Root
                accept="image/*"
                maxFiles={1}
                maxFileSize={5000000}
                className="flex gap-5 items-center flex-wrap"
              >
                <FileUpload.Context>
                  {({ acceptedFiles, dragging }) => {
                    const hasFile = acceptedFiles.length > 0;
                    const file = hasFile ? acceptedFiles[0] : null;

                    return (
                      <>
                        {/* Circle preview */}
                        <div className="w-[100px] h-[100px] rounded-full border border-dashed border-gray-400 bg-[#FFFAF5] flex items-center justify-center overflow-hidden">
                          {hasFile ? (
                            <img
                              src={URL.createObjectURL(file!)}
                              alt="Profile Preview"
                              className="object-cover w-full h-full rounded-full"
                            />
                          ) : (
                            <Upload className="w-[28px] text-gray-600" />
                          )}
                        </div>

                        {/* Upload zone (rectangle) */}
                        <FileUpload.Dropzone
                          className={`flex-1 border border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center py-[25px] transition-colors cursor-pointer ${
                            dragging
                              ? "bg-brand/20 border-brand"
                              : "bg-[#FFFAF5] hover:bg-brand-bg-100"
                          }`}
                        >
                          <FileUpload.Trigger className="flex flex-col items-center justify-center gap-2">
                            <ImageIcon className="w-[26px]" />
                            <span className="text-[15px] font-medium text-gray-700">
                              {hasFile
                                ? "Click to replace or drag and drop"
                                : "Click to upload or drag and drop"}
                            </span>

                            {/* File name or file type text */}
                            {hasFile ? (
                              <p className="text-[13px] text-gray-500">
                                {file?.name}
                              </p>
                            ) : (
                              <p className="text-[13px] text-gray-400">
                                JPG, PNG up to 5MB
                              </p>
                            )}
                          </FileUpload.Trigger>
                        </FileUpload.Dropzone>
                      </>
                    );
                  }}
                </FileUpload.Context>

                <FileUpload.HiddenInput />
              </FileUpload.Root>
            </div>
          </div>

          {/*Cover Photo*/}
          <FileUpload.Root
            accept=".jpg, .png, .jepg"
            maxFiles={1}
            maxFileSize={5000000}
            className="flex flex-col gap-[15px] rounded-2xl w-full"
          >
            <FileUpload.Label className="text-[18px]">
              Cover Photo
            </FileUpload.Label>
            <FileUpload.Context>
              {({ acceptedFiles, dragging }) => (
                <FileUpload.Dropzone
                  className={`border border-dashed border-gray-500 rounded-md flex flex-col items-center justify-center py-[30px] cursor-pointer transition-colors ${
                    dragging
                      ? "bg-brand border-brand"
                      : "bg-brand-bg-200 hover:bg-brand-bg-100"
                  }`}
                >
                  <FileUpload.Trigger>
                    <Upload className="w-[28px]" />
                  </FileUpload.Trigger>
                  {acceptedFiles.length > 0 ? (
                    <FileUpload.ItemGroup>
                      {acceptedFiles.map((file) => (
                        <FileUpload.Item
                          key={file.name}
                          file={file}
                          className="file-item"
                        >
                          <FileUpload.ItemName />
                        </FileUpload.Item>
                      ))}
                    </FileUpload.ItemGroup>
                  ) : (
                    "Click to upload or drag and drop"
                  )}
                  <p className="text-[13px] text-gray-400">
                    {acceptedFiles.length > 0
                      ? "Click to replace"
                      : "JPG, PNG up to 5MB"}
                  </p>
                </FileUpload.Dropzone>
              )}
            </FileUpload.Context>
            <FileUpload.HiddenInput />
          </FileUpload.Root>

          {/*Description*/}
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="address" className="text-[18px]">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              className="bg-brand-bg-200 rounded-md w-full border border-gray-200 p-3 text-[16px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Describe your restaurant, specialties, ambiance... "
            />
          </div>

          {/*Amenities*/}
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 text-brand">
              <Sparkle className="w-4" />
              <h3 className="text-[22px] font-semibold text-brand">
                Amenities Available
              </h3>
            </div>

            {/* Amenities Grid */}
            <Checkbox.Group
              onValueChange={console.log}
              className="grid grid-cols-2 gap-2 w-full"
            >
              {amenities.map((item) => (
                <Checkbox.Root
                  key={item.label}
                  value={item.label}
                  className=" bg-[#FFFAF5] border border-gray-300 rounded-xl p-4 flex flex-col justify-center items-center gap-3 cursor-pointer transition hover:shadow-md data-[state=checked]:bg-[#FFF3E8] data-[state=checked]:border-brand"
                >
                  <div className="relative flex flex-col justify-center items-center gap-2 w-full">
                    <div className="text-brand">{item.icon}</div>
                    <Checkbox.Label className="text-gray-700 text-[16px] font-medium">
                      {item.label}
                    </Checkbox.Label>

                    <Checkbox.Control className="absolute top-0 right-0">
                      <Checkbox.Indicator>
                        <div className="bg-brand rounded-full p-[3px] text-white">
                          <CheckIcon size={12} />
                        </div>
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                  </div>

                  <Checkbox.HiddenInput />
                </Checkbox.Root>
              ))}
            </Checkbox.Group>
          </div>

          {/*Table Setup*/}
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 text-brand">
              <UtensilsCrossed className="w-4" />
              <h3 className="text-[22px] font-semibold text-brand">
                Table Setup
              </h3>
            </div>

            <div className="grid grid-cols-12 text-[16px] gap-3 font-medium text-gray-800 w-full">
              <div className="col-span-8">Table Name</div>
              <div className="col-span-3">Capacity</div>
              <div className="col-span-1"></div>

              {tableSetup.map((table, idx) => (
                <div
                  key={idx}
                  className="col-span-12 grid grid-cols-12 gap-3 items-center w-full"
                >
                  <input
                    type="text"
                    value={table.tableName}
                    onChange={(e) =>
                      changeTableHandler(idx, "tableName", e.target.value)
                    }
                    placeholder="e.g., Table 1, VIP Room"
                    className="col-span-8 bg-[#FFF9F2] border border-gray-300 rounded-xl px-4 py-3 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <input
                    type="number"
                    value={table.capacity}
                    onChange={(e) =>
                      changeTableHandler(
                        idx,
                        "capacity",
                        Number(e.target.value),
                      )
                    }
                    placeholder="4"
                    className="col-span-3 bg-[#FFF9F2] border border-gray-300 rounded-xl px-4 py-3 text-center transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      delTableHandler(idx);
                    }}
                    className="col-span-1  cursor-pointer border border-brand text-brand rounded-xl p-2 hover:bg-[#FFF3E8] transition hover:shadow-md flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {/* Add Button */}
              <button
                type="button"
                onClick={addTableHandler}
                className="col-span-12 flex items-center justify-center gap-2 border border-brand text-brand rounded-2xl py-3 transition hover:shadow-md hover:bg-[#FFF3E8] "
              >
                <Plus size={18} /> Add Table
              </button>
            </div>
          </div>

          {/*Operating Hours*/}
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 text-brand">
              <Clock10 className="w-4" />
              <h3 className="text-[22px] font-semibold text-brand">
                Operating Hours
              </h3>
            </div>

            {/*Switch*/}
            <Switch.Root
              checked={isMondayTimingsChecked}
              onCheckedChange={(details) =>
                setIsMondayTimingsChecked(details.checked)
              }
              className="flex items-center justify-between gap-3 bg-brand-bg-100 p-4 rounded-lg border border-gray-300"
            >
              <Switch.Control className="relative w-11 h-6 bg-gray-300 rounded-full flex items-center transition-colors duration-200 ease-in-out data-[state=checked]:bg-orange-500 cursor-pointer">
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out translate-x-0.5 data-[state=checked]:translate-x-5" />
              </Switch.Control>
              <Switch.Label className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                Copy Monday Timings to all days
              </Switch.Label>
              <button
                disabled={!isMondayTimingsChecked}
                onClick={mondayCloneTiming}
                className="text-brand flex gap-3 cursor-pointer disabled:text-gray-400"
                type="button"
              >
                <Copy />
                <span>Apply</span>
              </button>
              <Switch.HiddenInput />
            </Switch.Root>

            {/*Grid*/}
            <div className="grid grid-cols-3 gap-3 pt-5">
              {Object.keys(operatingHrs).map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex justify-start items-center">{item}</div>
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-600">Opens at</span>
                    <div className="">
                      <TimePicker
                        placement="top"
                        value={
                          operatingHrs[item as keyof typeof operatingHrs]
                            .openingTime
                        }
                        onChange={(date) =>
                          changeOperatingHours(
                            item as keyof typeof operatingHrs,
                            "openingTime",
                            date as Date,
                          )
                        }
                        onClean={() =>
                          changeOperatingHours(
                            item as keyof typeof operatingHrs,
                            "openingTime",
                            midnight,
                          )
                        }
                        className="w-full"
                        format="hh:mm aa"
                        showMeridiem
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-600">Closes at</span>
                    <div className="">
                      <TimePicker
                        placement="top"
                        onChange={(date) =>
                          changeOperatingHours(
                            item as keyof typeof operatingHrs,
                            "closingTime",
                            date as Date,
                          )
                        }
                        onClean={() =>
                          changeOperatingHours(
                            item as keyof typeof operatingHrs,
                            "closingTime",
                            midnight,
                          )
                        }
                        value={
                          operatingHrs[item as keyof typeof operatingHrs]
                            .closingTime
                        }
                        className="w-full"
                        format="hh:mm aa"
                        showMeridiem
                      />
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/*Promotions*/}
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 text-brand">
              <Gift className="w-4" />
              <h3 className="text-[22px] font-semibold text-brand">
                Promotions
              </h3>
            </div>

            <Switch.Root className="flex items-center justify-between gap-3 bg-brand-bg-100 py-7 px-4 rounded-lg border border-brand shadow">
              <div className="flex flex-col">
                <Switch.Label className="text-md font-semibold text-gray-700 select-none cursor-pointer">
                  10% discount on first order
                </Switch.Label>
                <Switch.Label className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                  Attract new customers with a special first-time discount
                </Switch.Label>
              </div>
              <Switch.Control className="relative w-11 h-6 bg-gray-300 rounded-full flex items-center transition-colors duration-200 ease-in-out data-[state=checked]:bg-orange-500 cursor-pointer">
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out translate-x-0.5 data-[state=checked]:translate-x-5" />
              </Switch.Control>
              <Switch.HiddenInput />
            </Switch.Root>
          </div>

          {/* Buttons */}
          {/* <div className="font-inter text-[14px] flex justify-end pt-5">
            <button
              type="submit"
              className="bg-brand text-brand-white py-[16px] px-[35px] rounded-2xl border border-gray-200 hover:bg-orange-300 cursor-pointer"
            >
              Register Branch
            </button>
          </div> */}
          {/**/}
        </form>
      </div>
    </div>
  );
}
