import Image from "next/image";

export function MealPlan() {
  return (
    <div className="w-full rounded-[22px] ring-1 ring-brand font-fira py-[30px] px-[16px] flex flex-col gap-[20px] ">
      <div>
        <span className="text-brand text-[16px]">Meal</span>
      </div>
      <div className="center-div w-full">
        <span className="font-semibold text-[18px]">Choose Food</span>
        <div className="w-full grid grid-cols-2 gap-[20px] mt-[15px] ">
          <div className=" bg-brand h-[120px] rounded-3xl flex flex-col justify-center items-center gap-[5px] text-[12px] text-brand-white">
            <Image
              src={"/breakfast.svg"}
              alt="breakfast"
              width={30}
              height={30}
            />
            <span>Breakfast</span>
          </div>
          <div className=" bg-brand h-[120px] rounded-3xl flex flex-col justify-center items-center gap-[5px] text-[12px] text-brand-white">
            <Image src={"/lunch.svg"} alt="lunch" width={30} height={30} />
            <span>Lunch</span>
          </div>
          <div className=" bg-brand h-[120px] rounded-3xl flex flex-col justify-center items-center gap-[5px] text-[12px] text-brand-white">
            <Image src={"/snacks.svg"} alt="snacks" width={30} height={30} />
            <span>Snacks</span>
          </div>
          <div className=" bg-brand h-[120px] rounded-3xl flex flex-col justify-center items-center gap-[5px] text-[12px] text-brand-white">
            <Image src={"/dinner.svg"} alt="dinner" width={30} height={30} />
            <span>Dinner</span>
          </div>
        </div>
      </div>
      <div className="w-full center-div">
        <span className="font-semibold text-[16px]">Choose Cuisine</span>
        <div className="w-full grid grid-cols-2 gap-[20px] mt-[15px] ">
          <div className=" bg-brand h-[35px] rounded-3xl center-div text-[12px] text-brand-white">
            North Indian
          </div>
          <div className=" bg-brand h-[35px] rounded-3xl center-div text-[12px] text-brand-white">
            South Indian
          </div>
          <div className=" bg-brand h-[35px] rounded-3xl center-div text-[12px] text-brand-white">
            Multi Cuisine
          </div>
        </div>
      </div>
      <div className="w-full">
        <button className="w-full bg-blue-600 h-[35px] rounded-xl text-[12px] text-brand-white">
          Next
        </button>
      </div>
    </div>
  );
}
