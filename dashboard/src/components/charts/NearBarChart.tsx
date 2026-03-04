'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts'

const COLORS = ['#00C1DE', '#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4']

const tooltipStyle = {
  background: 'rgba(15, 17, 23, 0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  padding: '10px 14px',
}

export function NearBarChart({
  data,
  xKey,
  bars,
  formatX,
  formatY,
  stacked = false,
  horizontal = false,
  height = 260,
}: {
  data: object[]
  xKey: string
  bars: { key: string; label: string; color?: string }[]
  formatX?: (v: string) => string
  formatY?: (v: number) => string
  stacked?: boolean
  horizontal?: boolean
  height?: number
}) {
  const fmt = (v: number) => {
    if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B'
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
    return v.toFixed(1)
  }

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatY ?? fmt}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey={xKey}
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={120}
            tickFormatter={(v) =>
              String(v).length > 18 ? String(v).slice(0, 18) + '…' : String(v)
            }
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}
            itemStyle={{ color: '#fff', fontSize: 13 }}
            formatter={(v) => [formatY ? formatY(Number(v ?? 0)) : fmt(Number(v ?? 0))]}
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          />
          {bars.map((b, i) => (
            <Bar
              key={b.key}
              dataKey={b.key}
              name={b.label}
              fill={b.color ?? COLORS[i % COLORS.length]}
              radius={[0, 6, 6, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey={xKey}
          tickFormatter={formatX ?? ((v) => String(v).slice(5))}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatY ?? fmt}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}
          itemStyle={{ color: '#fff', fontSize: 13 }}
          formatter={(v, name) => [formatY ? formatY(Number(v ?? 0)) : fmt(Number(v ?? 0)), name as string]}
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
        />
        {bars.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingTop: 8 }}
          />
        )}
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.label}
            fill={b.color ?? COLORS[i % COLORS.length]}
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? undefined : [4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function NearPieChart({
  data,
  nameKey,
  valueKey,
  height = 260,
}: {
  data: object[]
  nameKey: string
  valueKey: string
  height?: number
}) {
  const sorted = [...data]
    .sort(
      (a, b) =>
        Number((b as Record<string, unknown>)[valueKey]) -
        Number((a as Record<string, unknown>)[valueKey])
    )
    .slice(0, 8)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 20, left: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          tickFormatter={(v) => {
            if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
            if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
            return String(v)
          }}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey={nameKey}
          tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={130}
          tickFormatter={(v) =>
            String(v).length > 20 ? String(v).slice(0, 20) + '…' : String(v)
          }
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          itemStyle={{ color: '#fff', fontSize: 13 }}
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
        />
        <Bar dataKey={valueKey} radius={[0, 6, 6, 0]} animationDuration={800} animationEasing="ease-out">
          {sorted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
