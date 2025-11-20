import { UserPlus } from "lucide-react";

export function FoodieSuggestions() {
  return (
    <div className="overflow-x-auto border border-brand rounded-3xl space-y-3 ">
      <div className="p-[20px] flex justify-between text-brand">
        <span className="flex justify-center items-center gap-4 ">
          <UserPlus />
          Foodie Suggestions
        </span>
        <span>View all</span>
      </div>
      <div className="flex flex-row w-full overflow-x-auto px-[20px] pb-[20px] gap-[20px]">
        {Array.from({ length: 15 }).map((_, idx) => (
          <SuggestionCard key={idx} />
        ))}
      </div>
    </div>
  );
}

function SuggestionCard() {
  return (
    <div className=" text-black rounded-2xl flex flex-col items-center p-4 space-y-3 border border-brand">
      {/* Profile Image */}
      <div className="relative pt-[25px] w-[64px]">
        <img
          src="https://placehold.co/96x96/8b5cf6/ffffff?text=IMG"
          alt="profile"
          className="rounded-full border-2 border-orange-500"
        />
      </div>

      {/* Mutual Text */}
      <div className="font-fira center-div">
        <p className="text-gray-900 text-[14px]">John Doe</p>
        <p className="text-gray-700 text-[10px]">5 mutual</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 w-full px-[10px] pb-[10px] font-fira text-[10px]">
        <button className="w-[77px] h-[32px] rounded-xl bg-orange-500 text-black font-semibold py-1.5  hover:bg-orange-600 transition">
          Accept
        </button>
        <button className="w-[77px] h-[32px] rounded-xl bg-white text-gray-700 ring-1 ring-gray-600 font-semibold py-1.5 hover:bg-gray-200 transition">
          Reject
        </button>
      </div>
    </div>
  );
}
