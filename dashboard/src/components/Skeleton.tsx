'use client'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400/80 backdrop-blur-sm">
      <span className="mr-2 opacity-60">⚠</span>
      Failed to load: {message}
    </div>
  )
}
