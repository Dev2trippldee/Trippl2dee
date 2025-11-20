import {
  Heart,
  Share2,
  Eye,
  Utensils,
  ClockFading,
  SendHorizontal,
} from "lucide-react";

export function RecipeCard() {
  return (
    <div className="w-full bg-white rounded-3xl ring-1 ring-brand space-y-[20px]">
      {/* Image */}
      <div className="relative">
        <img
          src="https://placehold.co/400x170/8b5cf6/ffffff?text="
          alt="Garlic Naan"
          className="w-full h-[170px] object-cover rounded-t-3xl"
        />
        <button className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md hover:text-orange-500 transition">
          <Heart size={18} />
        </button>
      </div>

      {/* Info Section */}
      <div className="p-[20px] space-y-[19px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="https://placehold.co/48x48/8b5cf6/ffffff?text="
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-800">Srinisha</span>
          </div>
          <button className="text-green-600 hover:text-green-700">
            <Share2 size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
          <div className="flex flex-row gap-2 items-center">
            <Utensils size={16} className="text-brand" />
            <span>Garlic Naan</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <ClockFading size={16} className="text-brand" />
            <span>7 months ago</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between mt-3 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Heart size={16} className="text-orange-500" />
            <span>20</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={16} />
            <span>32</span>
          </div>
          <div className="flex items-center gap-1">
            <SendHorizontal size={16} />
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
