export function SidebarProfileSkeleton() {
  return (
    <div className="bg-white rounded-3xl ring-1 ring-brand p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ProfileAnalyticsSkeleton() {
  return (
    <div className="bg-white rounded-3xl ring-1 ring-brand p-6 space-y-4 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-12 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function MealPlanSkeleton() {
  return (
    <div className="bg-white rounded-3xl ring-1 ring-brand p-6 space-y-4 animate-pulse">
      <div className="h-5 w-24 bg-gray-200 rounded" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-gray-200 rounded-lg" />
        <div className="h-16 w-full bg-gray-200 rounded-lg" />
        <div className="h-16 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function BMISkeleton() {
  return (
    <div className="bg-white rounded-3xl ring-1 ring-brand p-6 space-y-4 animate-pulse">
      <div className="h-5 w-20 bg-gray-200 rounded" />
      <div className="h-32 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}

export function DietSkeleton() {
  return (
    <div className="bg-white rounded-3xl ring-1 ring-brand p-6 space-y-4 animate-pulse">
      <div className="h-5 w-24 bg-gray-200 rounded" />
      <div className="space-y-2">
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}


