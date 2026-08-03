'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 8, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4 flex-1"
              style={{ opacity: 1 - rowIdx * 0.08 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
