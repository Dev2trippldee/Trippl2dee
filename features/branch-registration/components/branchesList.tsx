"use client";
import { Pencil, MapPin } from "lucide-react";
import Link from "next/link";

export function BranchesList() {
  const branches = [
    { name: "Six Sight Restaurant", city: "Coimbatore" },
    { name: "Six Sight Restaurant", city: "Chennai" },
    { name: "Six Sight Restaurant", city: "Bangalore" },
  ];

  return (
    <div className="bg-white w-full max-h-fit flex-2 rounded-[22px] p-2 md:p-8 shadow-md border border-gray-100">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-[24px] md:text-3xl font-semibold md:font-bold text-center text-brand">
          Branches
        </h1>
      </div>

      {/* Branches Cards */}
      <div className="flex flex-col gap-4 md:gap-6">
        {branches.map((branch, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Branch Image */}
            <div className="relative w-full h-[180px] md:h-[200px] bg-gray-200 overflow-hidden">
              <img
                src="https://placehold.co/400x200/FFE5D9/000000?text=Six+Sight+Restaurant"
                alt={branch.name}
                className="w-full h-full object-cover"
              />
              {/* Edit Button Overlay */}
              <button className="absolute top-3 right-3 bg-white text-brand p-2 rounded-full shadow-md hover:bg-brand hover:text-white transition-colors">
                <Pencil size={18} />
              </button>
            </div>

            {/* Branch Info */}
            <div className="p-3 md:p-4">
              <h2 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-2 line-clamp-1">
                {branch.name}
              </h2>
              <p className="text-[12px] md:text-[14px] text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {branch.city}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Branch Button */}
      <div className="flex justify-center mt-6 md:mt-10">
        <Link 
          href="/branch-registration"
          className="border border-brand text-brand font-medium rounded-2xl px-6 py-3 hover:bg-brand hover:text-white transition-colors text-[14px] md:text-[16px] inline-block"
        >
          Add more Branch
        </Link>
      </div>
    </div>
  );
}
