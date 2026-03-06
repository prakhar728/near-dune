'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function useRelativeTime(syncedAt: string | null | undefined): string | null {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!syncedAt) { setLabel(null); return }

    function compute() {
      const diffMs = Date.now() - new Date(syncedAt!).getTime()
      const diffMin = Math.floor(diffMs / 60000)
      const diffHr = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHr / 24)
      if (diffMin < 1) return 'just now'
      if (diffMin < 60) return `${diffMin}m ago`
      if (diffHr < 24) return `${diffHr}h ago`
      return `${diffDay}d ago`
    }

    setLabel(compute())
    const id = setInterval(() => setLabel(compute()), 60000)
    return () => clearInterval(id)
  }, [syncedAt])

  return label
}

export function Card({
  title,
  children,
  className = '',
  syncedAt,
  onRefresh,
  isRefreshing = false,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  syncedAt?: string | null
  onRefresh?: () => void
  isRefreshing?: boolean
}) {
  const timeLabel = useRelativeTime(syncedAt)

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`glass-card p-[var(--card-padding)] ${className}`}
    >
      {title && <h3 className="chart-title">{title}</h3>}
      {children}
      {timeLabel && onRefresh && (
        <div className="mt-2 flex items-center gap-1.5 justify-end">
          {isRefreshing && (
            <span className="text-[0.625rem] text-[var(--text-muted)] opacity-70">refreshing…</span>
          )}
          <span className="text-[0.625rem] text-[var(--text-muted)]">synced {timeLabel}</span>
          <button
            onClick={onRefresh}
            title="Refresh"
            disabled={isRefreshing}
            className="text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-40"
          >
            <RefreshCw size={10} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className="glass-card stat-card p-[var(--card-padding)]"
    >
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-3 text-[1.75rem] font-bold tracking-tight text-white leading-none">
        {value}
      </p>
      {sub && (
        <p className="mt-1.5 text-[0.6875rem] text-[var(--text-muted)]">{sub}</p>
      )}
    </motion.div>
  )
}
