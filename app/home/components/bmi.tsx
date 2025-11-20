"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const BMI = () => {
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(58);
  const [age, setAge] = useState(21);

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return { categoryx: "Underweight", color: "#3B82F6", rotation: -60 };
    if (bmi < 25)
      return { category: "Normal", color: "#10B981", rotation: -20 };
    if (bmi < 30)
      return { category: "Overweight", color: "#FCD34D", rotation: 20 };
    return { category: "Obesity", color: "#F97316", rotation: 60 };
  };

  const bmi = calculateBMI();
  const { category, color, rotation } = getBMICategory(parseFloat(bmi));

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full bg-white rounded-3xl shadow-lg p-6 ring-1 ring-brand">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">
          Calculate BMI
        </h1>

        {/* BMI Gauge */}
        <div className="relative mb-6">
          <svg viewBox="0 0 200 120" className="w-full">
            {/* Arrowhead definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="4"
                markerHeight="4"
                refX="2.5"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L4,2 L0,4 Z" fill={color} />
              </marker>
            </defs>

            {/* Gauge segments */}
            <path
              d="M 20 100 A 80 80 0 0 1 60 30"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="20"
            />
            <path
              d="M 60 30 A 80 80 0 0 1 100 20"
              fill="none"
              stroke="#10B981"
              strokeWidth="20"
            />
            <path
              d="M 100 20 A 80 80 0 0 1 140 30"
              fill="none"
              stroke="#FCD34D"
              strokeWidth="20"
            />
            <path
              d="M 140 30 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#F97316"
              strokeWidth="20"
            />

            {/* Needle */}
            <g transform={`rotate(${rotation} 100 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="40"
                stroke={color}
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
              />
              <circle cx="100" cy="100" r="5" fill={color} />
            </g>

            {/* Center circle */}
            <circle cx="100" cy="100" r="30" fill="white" />
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-xs fill-orange-500 font-semibold"
            >
              BMI
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              className="text-lg fill-orange-500 font-bold"
            >
              {bmi}
            </text>
          </svg>

          {/* Category badge */}
          <div className="flex justify-center mt-2">
            <div
              style={{ backgroundColor: color }}
              className=" text-white px-4 py-1 rounded-full text-sm font-semibold"
            >
              {category}
            </div>
          </div>
        </div>

        <p className="text-center text-orange-500 text-sm mb-6">
          Healthy BMI range: 18.5 kg/m2 - 25kg/m2
        </p>

        {/* Gender Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setGender("male")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
              gender === "male"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 border-2 border-gray-200"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="10" cy="14" r="4" />
              <path d="M10 6v2m0 6v6m-3-3h6m6-14l-5 5m5-5v5m0-5h-5" />
            </svg>
            Male
          </button>
          <button
            onClick={() => setGender("female")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
              gender === "female"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 border-2 border-gray-200"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M12 12v9m-3-3h6" />
            </svg>
            Female
          </button>
        </div>

        {/* Height Slider */}
        <div className="bg-orange-400 rounded-2xl p-6 mb-4">
          <p className="text-white text-sm text-center mb-2">Height (in cm)</p>
          <p className="text-white text-4xl font-bold text-center mb-4">
            {height} cm
          </p>
          <input
            type="range"
            min="100"
            max="220"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            className="w-full h-1 bg-orange-300 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #fb923c 0%, #fb923c ${((height - 100) / 120) * 100}%, #fed7aa ${((height - 100) / 120) * 100}%, #fed7aa 100%)`,
            }}
          />
        </div>

        {/* Weight and Age */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-400 rounded-2xl p-6">
            <p className="text-white text-sm text-center mb-2">Weight (kg)</p>
            <p className="text-white text-4xl font-bold text-center mb-4">
              {weight}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setWeight(Math.max(20, weight - 1))}
                className="bg-white rounded-full p-2 hover:bg-gray-100 transition"
              >
                <ChevronDown size={20} className="text-orange-400" />
              </button>
              <button
                onClick={() => setWeight(Math.min(200, weight + 1))}
                className="bg-white rounded-full p-2 hover:bg-gray-100 transition"
              >
                <ChevronUp size={20} className="text-orange-400" />
              </button>
            </div>
          </div>

          <div className="bg-orange-400 rounded-2xl p-6">
            <p className="text-white text-sm text-center mb-2">Age (years)</p>
            <p className="text-white text-4xl font-bold text-center mb-4">
              {age}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setAge(Math.max(1, age - 1))}
                className="bg-white rounded-full p-2 hover:bg-gray-100 transition"
              >
                <ChevronDown size={20} className="text-orange-400" />
              </button>
              <button
                onClick={() => setAge(Math.min(120, age + 1))}
                className="bg-white rounded-full p-2 hover:bg-gray-100 transition"
              >
                <ChevronUp size={20} className="text-orange-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BMI };
