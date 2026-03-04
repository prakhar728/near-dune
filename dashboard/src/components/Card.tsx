'use client'
import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
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
