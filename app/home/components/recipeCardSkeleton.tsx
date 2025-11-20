export function RecipeCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-3xl ring-1 ring-brand space-y-[20px] animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-[170px] bg-gray-200 rounded-t-3xl" />

      {/* Info Section Skeleton */}
      <div className="p-[20px] space-y-[19px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded" />
        </div>

        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>

        {/* Stats Skeleton */}
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}


