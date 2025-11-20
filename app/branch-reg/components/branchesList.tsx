"use client";
import { Pencil } from "lucide-react";

export function BranchesList() {
  const branches = [
    { name: "Six Sight Restaurant", city: "Coimbatore" },
    { name: "Six Sight Restaurant", city: "Chennai" },
    { name: "Six Sight Restaurant", city: "Bangalore" },
  ];

  return (
    <div className="bg-white w-full rounded-[22px] p-3 md:p-5 shadow-md border border-orange-200">
      {/* Header */}
      <div className="mb-3 md:mb-5">
        <h1 className="text-[17px] md:text-[20px] font-bold text-brand text-center">
          Branches
        </h1>
      </div>

      {/* Branches Cards - Horizontal Layout */}
      <div className="flex flex-col gap-2.5 md:gap-3 mb-3 md:mb-5">
        {branches.map((branch, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-2.5 md:gap-3 p-1.5 md:p-2.5"
          >
            {/* Branch Image - Left Side */}
            <div className="relative w-14 h-14 md:w-[68px] md:h-[68px] flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src="https://placehold.co/200x200/FFE5D9/000000?text=Restaurant"
                alt={branch.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Branch Info - Middle */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <h2 className="text-[12px] md:text-[14px] font-bold text-gray-900 line-clamp-1">
                {branch.name}
              </h2>
              {/* Location Tag - Orange bordered oval */}
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full border border-brand text-[9px] md:text-[10px] font-medium text-gray-900 w-fit">
                {branch.city}
              </span>
            </div>

            {/* Edit Icon - Right Side - Orange square with pencil */}
            <button className="flex-shrink-0 bg-brand text-white p-1.5 md:p-2 rounded-lg hover:bg-orange-600 transition-colors">
              <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Branch Button - Orange border, white background */}
      <div className="flex justify-center">
        <button className="border-2 border-brand bg-white text-gray-900 font-medium rounded-xl px-5 py-2 hover:bg-brand-bg-100 transition-colors text-[11px] md:text-[13px]">
          Add more Branch
        </button>
      </div>
    </div>
  );
}
