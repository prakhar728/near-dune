'use client'
import { motion } from 'framer-motion'
import { useDuneQuery } from '@/lib/useDuneQuery'
import { QUERY_IDS } from '@/lib/queryIds'
import { Card, StatCard } from '@/components/Card'
import { ChartSkeleton, ErrorBox } from '@/components/Skeleton'
import { NearLineChart } from '@/components/charts/NearLineChart'
import { NearBarChart } from '@/components/charts/NearBarChart'

function fmt(v: number) {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Number(v).toFixed(0))
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export function NetworkSection({ timePeriod }: { timePeriod: string }) {
  const overview = useDuneQuery(QUERY_IDS.networkOverview, timePeriod)
  const actions = useDuneQuery(QUERY_IDS.actionTypes, timePeriod)
  const gas = useDuneQuery(QUERY_IDS.gasUtilization, timePeriod)
  const delegates = useDuneQuery(QUERY_IDS.delegateActions, timePeriod)

  const latest = overview.data[overview.data.length - 1]
  const totalTxns = overview.data.reduce((s, r) => s + Number(r.total_txns ?? 0), 0)
  const totalUsers = overview.data.reduce((s, r) => s + Number(r.active_users ?? 0), 0)
  const avgSuccess = latest ? Number(latest.success_rate_pct).toFixed(1) : '—'
  const avgGasUtil = gas.data.length
    ? (gas.data.reduce((s, r) => s + Number(r.gas_utilization_pct ?? 0), 0) / gas.data.length).toFixed(1)
    : '—'

  const actionPivot = (() => {
    const map: Record<string, Record<string, number>> = {}
    for (const r of actions.data) {
      const date = String(r.block_date)
      if (!map[date]) map[date] = { block_date: date as unknown as number }
      map[date][String(r.action_kind)] = Number(r.action_count ?? 0)
    }
    return Object.values(map).sort((a, b) => String(a.block_date).localeCompare(String(b.block_date)))
  })()

  const actionKinds = [...new Set(actions.data.map((r) => String(r.action_kind)))]

  return (
    <section>
      <h2 className="section-title">Network & Chain Health</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatCard label="Total Transactions" value={fmt(totalTxns)} />
        <StatCard label="Cumulative Active Users" value={fmt(totalUsers)} />
        <StatCard label="Success Rate" value={`${avgSuccess}%`} sub="latest day" />
        <StatCard label="Avg Gas Utilization" value={`${avgGasUtil}%`} sub="of block capacity" />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily Transactions & Active Users">
          {overview.state === 'loading' && <ChartSkeleton />}
          {overview.state === 'error' && <ErrorBox message={overview.error!} />}
          {overview.state === 'success' && (
            <NearLineChart
              data={overview.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'total_txns', label: 'Transactions' },
                { key: 'active_users', label: 'Active Users' },
              ]}
            />
          )}
        </Card>

        <Card title="Transaction Success Rate (%)">
          {overview.state === 'loading' && <ChartSkeleton />}
          {overview.state === 'error' && <ErrorBox message={overview.error!} />}
          {overview.state === 'success' && (
            <NearLineChart
              data={overview.data as object[]}
              xKey="block_date"
              lines={[{ key: 'success_rate_pct', label: 'Success Rate %' }]}
              formatY={(v) => `${v.toFixed(1)}%`}
            />
          )}
        </Card>

        <Card title="Action Type Breakdown (Daily)">
          {actions.state === 'loading' && <ChartSkeleton />}
          {actions.state === 'error' && <ErrorBox message={actions.error!} />}
          {actions.state === 'success' && (
            <NearBarChart
              data={actionPivot as object[]}
              xKey="block_date"
              bars={actionKinds.map((k) => ({ key: k, label: k }))}
              stacked
            />
          )}
        </Card>

        <Card title="Block Gas Utilization (%)">
          {gas.state === 'loading' && <ChartSkeleton />}
          {gas.state === 'error' && <ErrorBox message={gas.error!} />}
          {gas.state === 'success' && (
            <NearLineChart
              data={gas.data as object[]}
              xKey="block_date"
              lines={[{ key: 'gas_utilization_pct', label: 'Gas Used %' }]}
              formatY={(v) => `${v.toFixed(1)}%`}
            />
          )}
        </Card>

        <Card title="Delegate (Meta-Transaction) Actions">
          {delegates.state === 'loading' && <ChartSkeleton />}
          {delegates.state === 'error' && <ErrorBox message={delegates.error!} />}
          {delegates.state === 'success' && (
            <NearLineChart
              data={delegates.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'delegate_actions', label: 'Delegate Actions' },
                { key: 'unique_senders', label: 'Unique Senders' },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
