export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl p-4 animate-pulse space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
          <div className="flex gap-4 mt-2">
            <div className="h-3 bg-gray-700 rounded w-16" />
            <div className="h-3 bg-gray-700 rounded w-12" />
            <div className="h-3 bg-gray-700 rounded w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-700" />
          <div className="w-8 h-8 rounded-lg bg-gray-700" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface rounded-xl p-4 border-l-4 border-gray-700 animate-pulse">
          <div className="h-3 bg-gray-700 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-700 rounded w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
