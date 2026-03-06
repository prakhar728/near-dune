'use client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'

const COLORS = ['#00EC97', '#6B5CE7', '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4']

const tooltipStyle = {
  background: '#111111',
  border: '1px solid #222222',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  padding: '10px 14px',
}

export function NearLineChart({
  data,
  xKey,
  lines,
  formatX,
  formatY,
  height = 260,
}: {
  data: object[]
  xKey: string
  lines: { key: string; label: string }[]
  formatX?: (v: string) => string
  formatY?: (v: number) => string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((l, i) => (
            <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey={xKey}
          tickFormatter={formatX ?? ((v) => String(v).slice(5))}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatY ?? ((v) => fmt(v))}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}
          itemStyle={{ color: '#fff', fontSize: 13 }}
          formatter={(v, name) => [
            formatY ? formatY(Number(v ?? 0)) : fmt(Number(v ?? 0)),
            name as string,
          ]}
          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
        />
        {lines.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingTop: 8 }}
          />
        )}
        {lines.map((l, i) => (
          <Area
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            fill={`url(#grad-${l.key})`}
            dot={false}
            activeDot={{
              r: 4,
              stroke: COLORS[i % COLORS.length],
              strokeWidth: 2,
              fill: '#000',
            }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function fmt(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return v.toFixed(2)
}
