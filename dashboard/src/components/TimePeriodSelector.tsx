'use client'
import { motion } from 'framer-motion'

export type TimePeriod = '24H' | '7D' | '30D' | '1Y' | 'All Time'

const PERIODS: TimePeriod[] = ['24H', '7D', '30D', '1Y', 'All Time']

export function TimePeriodSelector({
  value,
  onChange,
}: {
  value: TimePeriod
  onChange: (p: TimePeriod) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-[#222] bg-[#111] p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="period-pill relative"
        >
          {value === p && (
            <motion.div
              layoutId="period-active"
              className="absolute inset-0 rounded-[10px] bg-[#00EC97]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className={`relative z-10 ${value === p ? 'text-black font-semibold' : ''}`}>
            {p}
          </span>
        </button>
      ))}
    </div>
  )
}
