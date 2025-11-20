"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Restaurant {
  id: number;
  name: string;
  image: string;
  location?: string;
  discount?: string;
}

// Dummy restaurant data
const dummyRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "Selva's Sea View Restaurant",
    image: "https://placehold.co/300x200/FFE5D9/000000?text=Selva%27s+Sea+View",
    location: "Coimbatore",
    discount: "20% OFF",
  },
  {
    id: 2,
    name: "MADRAS HOTEL",
    image: "https://placehold.co/300x200/FFE5D9/000000?text=MADRAS+HOTEL",
    location: "Chennai",
    discount: "15% OFF",
  },
  {
    id: 3,
    name: "Spice Garden",
    image: "https://placehold.co/300x200/FFE5D9/000000?text=Spice+Garden",
    location: "Bangalore",
    discount: "25% OFF",
  },
  {
    id: 4,
    name: "Royal Biryani House",
    image: "https://placehold.co/300x200/FFE5D9/000000?text=Royal+Biryani",
    location: "Hyderabad",
    discount: "30% OFF",
  },
  {
    id: 5,
    name: "Coastal Delights",
    image: "https://placehold.co/300x200/FFE5D9/000000?text=Coastal+Delights",
    location: "Mumbai",
    discount: "18% OFF",
  },
  {
    id: 6,
    name: "North Indian Kitchen",
    image: "https://placehold.co/300x200/FFE5D9/000000?text=North+Indian",
    location: "Delhi",
    discount: "22% OFF",
  },
];

export function DiscountRestaurant() {
  return (
    <div className="w-full bg-white rounded-[22px] p-2 md:p-1 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-brand">
          Discount Restaurant
        </h2>
        <Link
          href="/restaurants"
          className="flex items-center gap-1 text-brand text-[12px] md:text-[14px] hover:text-orange-600 transition-colors"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Horizontal Scrollable Restaurant Cards */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="flex gap-4 md:gap-6 pb-2">
          {dummyRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
            >
              {/* Restaurant Image */}
              <div className="relative w-full h-[180px] md:h-[200px] bg-gray-200 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                {/* Discount Badge */}
                {restaurant.discount && (
                  <div className="absolute top-3 right-3 bg-brand text-white px-3 py-1 rounded-full text-xs md:text-sm font-semibold shadow-md">
                    {restaurant.discount}
                  </div>
                )}
              </div>

              {/* Restaurant Info */}
              <div className="p-3 md:p-4">
                <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-1 line-clamp-1">
                  {restaurant.name}
                </h3>
                {restaurant.location && (
                  <p className="text-[12px] md:text-[14px] text-gray-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {restaurant.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}






