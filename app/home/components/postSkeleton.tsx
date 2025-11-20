export function PostSkeleton() {
  return (
    <div className="max-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 ring-1 ring-brand animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start sm:items-center justify-between p-3 sm:p-4 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="h-3.5 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded" />
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-200 rounded flex-shrink-0" />
              <div className="h-4 sm:h-5 w-14 sm:w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="h-2.5 sm:h-3 w-24 sm:w-32 bg-gray-200 rounded" />
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-gray-200 rounded" />
              <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="h-7 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-full hidden sm:block" />
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton - Randomly show or hide */}
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 space-y-1.5 sm:space-y-2">
        <div className="h-3.5 sm:h-4 w-full bg-gray-200 rounded" />
        <div className="h-3.5 sm:h-4 w-5/6 bg-gray-200 rounded" />
      </div>

      {/* Media Skeleton - Can be image or video */}
      <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-gray-200" />

      {/* Stats Skeleton */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border-t border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-200 rounded" />
          <div className="h-3 sm:h-4 w-10 sm:w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 rounded" />
      </div>

      {/* Actions Skeleton */}
      <div className="flex items-center justify-around px-3 sm:px-4 py-2 border-t border-gray-200">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 rounded" />
          <div className="h-3 sm:h-4 w-10 sm:w-12 bg-gray-200 rounded hidden sm:block" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 rounded" />
          <div className="h-3 sm:h-4 w-14 sm:w-16 bg-gray-200 rounded hidden sm:block" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 rounded" />
          <div className="h-3 sm:h-4 w-10 sm:w-12 bg-gray-200 rounded hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

