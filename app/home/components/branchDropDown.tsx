"use client";
import { useState } from "react";

export default function BranchDropdown() {
  const [open, setOpen] = useState(false);

  const branches = [
    "Main Branch",
    "South Branch",
    "North Branch",
    "East Branch",
  ];

  return (
    <div
      className="relative inline-block text-left"
      onBlur={() => setOpen(false)}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 hover:text-orange-600 focus:outline-none cursor-pointer"
      >
        Branch
        <img
          src="/keyboard_arrow_down.svg"
          alt=""
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute left-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
          <ul className="py-1">
            {branches.map((branch) => (
              <li
                key={branch}
                className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                onClick={() => {
                  console.log(`Selected: ${branch}`);
                  setOpen(false);
                }}
              >
                {branch}
              </li>
            ))}
            <li className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex justify-start items-center gap-3">
              Add Branch
              <img src="/plus-fill.svg" className="w-4" alt="" />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
