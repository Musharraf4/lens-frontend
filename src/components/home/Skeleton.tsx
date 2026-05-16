import { Skeleton } from "../ui/skeleton";

export const MarketingInsightCardSkeleton = ({ isLast = false }) => (
  <div
    className={`bg-white p-4 flex-1 ${!isLast ? "border-r border-gray-200" : ""
      }`}
  >
    <Skeleton className="h-4 w-32 mb-4" />
    <Skeleton className="h-4 w-48" />
  </div>
);

// Main Metric Card Skeleton
export function MainMetricCardSkeleton({
  bgColor = "bg-gray-100",
  className = "",
}: {
  bgColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`min-h-[180px] sm:min-h-[200px] relative p-6 rounded-xl transition-all ${bgColor} ${className} animate-pulse`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 bg-gray-200 rounded-full w-24"></div>
        <div className="h-6 w-6 rounded-full bg-gray-300"></div>
      </div>
      <div className="flex flex-col gap-y-4 pt-8">
        <div className="h-9 bg-gray-300 rounded-full w-32"></div>
        <div className="h-4 bg-gray-200 rounded-full w-16"></div>
      </div>
    </div>
  );
}

// CPA Card Skeleton
export const CPACardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center">
        <Skeleton className="h-4 w-8 mr-1" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <div className="mb-2">
      <div className="flex justify-between items-baseline">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
    <div className="mt-4">
      <Skeleton className="h-4 w-12 mb-2" />
      <div className="flex justify-between items-baseline">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg">
    <Skeleton className="h-4 w-12 mb-4" />
    <div className="mb-2">
      <div className="flex justify-between items-baseline">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
    <div className="mt-4">
      <Skeleton className="h-4 w-12 mb-2" />
      <div className="flex justify-between items-baseline">
        <Skeleton className="h-6 w-10" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  </div>
);

// Extra Skeletons
export const SmallMetricCardSkeleton = () => (
  <div className="bg-white p-4 rounded-3xl">
    <Skeleton className="h-4 w-16 mb-2" />
    <Skeleton className="h-6 w-20 mb-1" />
    <Skeleton className="h-4 w-12" />
  </div>
);

export const ChartSkeleton = ({ height = "h-72" }) => (
  <div
    className={`bg-white rounded-lg p-4 ${height} flex flex-col justify-between`}
  >
    <Skeleton className="h-4 w-32 mb-4" />
    <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse flex-grow"></div>
  </div>
);

export const ChartRoundSkeleton = () => (
  <div className="animate-pulse bg-white p-4 rounded-lg">
    <div className="relative flex items-center justify-center">
      <div className="rounded-full bg-gray-200 w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56"></div>

      <div className="absolute flex flex-col items-center gap-2 w-20 sm:w-24 md:w-32">
        <div className="h-4 sm:h-5 md:h-6 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-3 sm:h-4 md:h-5 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-4 sm:h-5 md:h-6 w-2/3 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

export const SkeletonBarChart = ({ size }: { size?: number }) => {
  const barHeights = [24, 12, 72, 48, 48, 36, 24, 36, 48, 72, 36, 24];
  const visibleBars = size ? barHeights.slice(0, size) : barHeights;

  return (
    <div className="flex space-x-2 justify-between items-end w-full animate-pulse overflow-hidden">
      {visibleBars.map((height, index) => (
        <div
          key={index}
          className={`bg-gray-300 rounded-sm h-${height} w-15`}
        ></div>
      ))}
    </div>
  );
};

// SkeletonHorizontalBarChart.tsx

export const SkeletonHorizontalBarChart = ({ size = 5 }: { size?: number }) => {
  // Simulate varying bar widths
  const barWidths = [60, 100, 40, 50, 30].slice(0, size);

  return (
    <div className="space-y-4 w-full animate-pulse">
      {barWidths.map((width, index) => (
        <div
          key={index}
          className={`h-10 rounded bg-gradient-to-r from-gray-200 to-gray-300`}
          style={{ width: `${width}%` }}
        ></div>
      ))}
    </div>
  );
};

export const ContactDetailsSidebarSkeleton = () => (
  <aside className="w-full bg-white rounded-2xl p-6 shadow">
    <div className="flex flex-col gap-6">
      {/* Job type skeleton */}
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      {/* Revenue skeleton */}
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      {/* Phone skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      {/* Website skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
      {/* Location skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
      {/* Map skeleton */}
      <Skeleton className="h-[140px] w-full rounded-xl" />
      {/* Review skeleton */}
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  </aside>
);
