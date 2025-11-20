export function SidebarProfile() {
  const profile = {
    name: "Elite Restaurant",
    isVerified: true,
    searchTags:
      "Search recipes, restaurants, users | Recipes, restaurants, users",
    searchTagsSecondary: "Search recipes | Recipes, restaurants, users",
    location: "Coimbatore, Tamil Nadu",
    stats: [
      { label: "Foodies", value: 22, color: "text-orange-600" },
      { label: "Followers", value: 111, color: "text-orange-600" },
      { label: "Following", value: 100, color: "text-orange-600" },
    ],
  };
  return (
    <div className='w-full flex items-start justify-center font-inter '>
      <div className='w-full bg-white  rounded-[22px] overflow-hidden ring-1 ring-brand'>
        {/* 1. Banner Image Area */}
        <div className=' h-1/3 bg-gray-300'>
          <img
            src='https://placehold.co/600x200/ffedd8/000000?text=Restaurant+Facade'
            alt='Restaurant Banner'
            className='w-full h-full object-cover'
          />
        </div>

        {/* 2. Content Area */}
        <div className='p-[16px] pt-0'>
          <div className='w-full flex flex-row justify-between'>
            <div className='mt-[-12%] w-[98px] h-[98px] rounded-full overflow-hidden shadow-lg'>
              <img
                src='https://placehold.co/128x128/000000/ffffff?text=ELITE'
                alt='Elite Restaurant Logo'
                className='w-full h-full object-cover'
              />
            </div>

            <div className=''>
              <button className='w-[36px] h-[18px] text-[10px] font-fira font-normal text-brand bg-brand-white border border-brand  rounded-full hover:bg-brand-bg-200 cursor-pointer'>
                Edit
              </button>
            </div>
          </div>

          {/* 3. Title/Name */}
          <div className='mt-4 flex items-center'>
            <h1 className='text-[18px] font-fira font-semibold text-gray-900 mr-2'>
              {profile.name}
            </h1>
            {profile.isVerified && <img src='/green-verified.svg' alt='' />}
          </div>

          {/* 4. Description/Metadata */}
          <div className='mt-[8px] text-[13px] font-fira font-normal text-gray-500 space-y-1'>
            <p className=''>{profile.searchTags}</p>
            <p className=''>{profile.searchTagsSecondary}</p>
            <p className=''>{profile.location}</p>
          </div>
          {/* 5. Stats */}
          <div className='space-y-[12px] mt-[18px]'>
            {profile.stats.map((stat) => (
              <div
                key={stat.label}
                className='flex justify-between items-center'
              >
                <span className='text-[16px] font-fira font-normal text-gray-700'>
                  {stat.label}
                </span>
                <span className={`text-[16px] font-normal text-brand`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
