'use client'
import { motion } from 'framer-motion'
import { useDuneQuery } from '@/lib/useDuneQuery'
import { QUERY_IDS } from '@/lib/queryIds'
import { Card, StatCard } from '@/components/Card'
import { ChartSkeleton, ErrorBox } from '@/components/Skeleton'
import { NearLineChart } from '@/components/charts/NearLineChart'
import { DataTable } from '@/components/DataTable'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export function TokensSection({ timePeriod }: { timePeriod: string }) {
  const daily = useDuneQuery(QUERY_IDS.ftDailyActivity, timePeriod)
  const top = useDuneQuery(QUERY_IDS.topTokens, timePeriod)

  const totalEvents = daily.data.reduce((s, r) => s + Number(r.transfer_events ?? 0), 0)
  const totalUsers = daily.data.reduce((s, r) => s + Number(r.unique_users ?? 0), 0)
  const peakTokens = daily.data.reduce((max, r) => Math.max(max, Number(r.unique_tokens ?? 0)), 0)

  return (
    <section>
      <h2 className="section-title">Fungible Tokens (FT)</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Total Transfer Events" value={totalEvents.toLocaleString()} />
        <StatCard label="Cumulative Users" value={totalUsers.toLocaleString()} />
        <StatCard label="Peak Active Tokens / Day" value={peakTokens.toLocaleString()} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily FT Transfer Events">
          {daily.state === 'loading' && <ChartSkeleton />}
          {daily.state === 'error' && <ErrorBox message={daily.error!} />}
          {daily.state === 'success' && (
            <NearLineChart
              data={daily.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'transfer_events', label: 'Transfer Events' },
                { key: 'unique_users', label: 'Unique Users' },
              ]}
            />
          )}
        </Card>

        <Card title="Daily Mint vs Transfer vs Burn">
          {daily.state === 'loading' && <ChartSkeleton />}
          {daily.state === 'error' && <ErrorBox message={daily.error!} />}
          {daily.state === 'success' && (
            <NearLineChart
              data={daily.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'mint_events', label: 'Mints' },
                { key: 'transfer_count', label: 'Transfers' },
                { key: 'burn_events', label: 'Burns' },
              ]}
            />
          )}
        </Card>

        <Card title="Top Tokens by Transfer Activity" className="md:col-span-2">
          {top.state === 'loading' && <ChartSkeleton />}
          {top.state === 'error' && <ErrorBox message={top.error!} />}
          {top.state === 'success' && (
            <DataTable
              rows={top.data}
              maxRows={20}
              columns={[
                { key: 'token_id', label: 'Token' },
                { key: 'transfer_events', label: 'Events', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_users', label: 'Users', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'mint_count', label: 'Mints', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'transfer_count', label: 'Transfers', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'burn_count', label: 'Burns', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
