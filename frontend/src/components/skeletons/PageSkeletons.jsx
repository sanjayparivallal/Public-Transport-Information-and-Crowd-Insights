const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton ${className}`.trim()} aria-hidden="true" />
);

export const DashboardPageSkeleton = () => (
  <div className="space-y-8 animate-fade-in-up" role="status" aria-label="Loading dashboard">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`dashboard-stat-${i}`} className="rounded-[1.5rem] border border-blue-100 bg-white/80 p-5 sm:p-6">
          <SkeletonBlock className="h-11 w-11 rounded-xl mb-4" />
          <SkeletonBlock className="h-8 w-16 mb-2" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      ))}
    </div>

    {Array.from({ length: 2 }).map((_, sectionIdx) => (
      <div key={`dashboard-section-${sectionIdx}`} className="rounded-[2rem] border border-blue-100 bg-white/90 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonBlock className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, cardIdx) => (
            <div key={`dashboard-card-${sectionIdx}-${cardIdx}`} className="rounded-2xl border border-blue-100 bg-white p-4 space-y-3">
              <SkeletonBlock className="h-4 w-3/5" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SearchResultsSkeleton = ({ rows = 3 }) => (
  <div className="space-y-5" role="status" aria-label="Loading search results">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={`search-skeleton-${i}`} className="rounded-[2rem] p-8 border border-blue-100 bg-white/90 flex gap-6">
        <SkeletonBlock className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonBlock className="h-4 w-1/4" />
          <SkeletonBlock className="h-6 w-1/2" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-10 w-40" />
        </div>
      </div>
    ))}
  </div>
);

export const TransportDetailSkeleton = () => (
  <div className="min-h-screen pb-16">
    <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-8 pb-4">
      <div className="rounded-[2.5rem] border border-blue-100 bg-white/90 p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="h-7 w-24 rounded-full" />
          <SkeletonBlock className="h-7 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="h-10 w-2/5" />
        <SkeletonBlock className="h-5 w-3/5" />
      </div>
    </div>

    <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-20 space-y-8">
      <div className="rounded-[2.5rem] border border-blue-100 bg-white/90 p-8 space-y-4">
        <SkeletonBlock className="h-6 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={`detail-summary-${i}`} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-[2.5rem] border border-blue-100 bg-white/90 p-8 space-y-4">
            <SkeletonBlock className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={`detail-left-${i}`} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-blue-100 bg-white/90 p-8 space-y-4">
            <SkeletonBlock className="h-6 w-36" />
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={`detail-timeline-${i}`} className="h-9 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-[2.5rem] border border-blue-100 bg-white/90 p-8 space-y-4 h-fit">
          <SkeletonBlock className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={`detail-right-${i}`} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
