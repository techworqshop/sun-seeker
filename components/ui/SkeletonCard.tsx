'use client';

export function SkeletonCard() {
  return (
    <div className="w-full flex items-center gap-3 p-3 glass-strong rounded-xl animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-sun-peach/20 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-sun-peach/15 rounded w-2/3" />
        <div className="h-2.5 bg-sun-peach/10 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
