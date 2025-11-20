"use client";

import { useState } from "react";

export function Diet() {
  const [selectedDiet, setSelectedDiet] = useState("");

  const dietOptions = [
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low carb",
    "Diabetic (Type 1 / type 2)",
    "Normal",
    "Vegan",
    "High protein",
  ];

  const handleSelect = (diet: string) => {
    setSelectedDiet(diet);
  };

  return (
    <div className="flex justify-center rounded-3xl items-center ring-1 ring-brand">
      <div className="w-full rounded-3xl p-5 bg-white">
        <h2 className="text-orange-500 text-sm font-semibold mb-1">Diet</h2>
        <h1 className="text-xl font-semibold mb-4 text-center">
          Choose Diet Type
        </h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {dietOptions.map((diet) => (
            <button
              key={diet}
              onClick={() => handleSelect(diet)}
              className={`py-2 rounded-xl font-medium text-white transition-colors duration-200 ${
                selectedDiet === diet
                  ? "bg-brand"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {diet}
            </button>
          ))}
        </div>

        <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-xl transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}
