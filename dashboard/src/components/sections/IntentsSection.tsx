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

export function IntentsSection({ timePeriod }: { timePeriod: string }) {
  const daily = useDuneQuery(QUERY_IDS.intentsDaily, timePeriod)
  const tokensRefs = useDuneQuery(QUERY_IDS.intentTokensReferrers, timePeriod)

  const totalTxns = daily.data.reduce((s, r) => s + Number(r.intent_txns ?? 0), 0)
  const totalUsers = daily.data.reduce((s, r) => s + Number(r.unique_users ?? 0), 0)

  const tokenRows = tokensRefs.data.filter((r) => r.category === 'token')
  const referrerRows = tokensRefs.data.filter((r) => r.category === 'referrer')

  return (
    <section>
      <h2 className="section-title">NEAR Intents (DIP-4)</h2>
      <p className="section-subtitle">
        Intent-based transactions via intents.near — NEP-245 multi-token standard, DIP-4 Defuse Intent Protocol.
      </p>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Total Intent Txns" value={totalTxns.toLocaleString()} />
        <StatCard label="Cumulative Users" value={totalUsers.toLocaleString()} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily Intent Transactions & Users">
          {daily.state === 'loading' && <ChartSkeleton />}
          {daily.state === 'error' && <ErrorBox message={daily.error!} />}
          {daily.state === 'success' && (
            <NearLineChart
              data={daily.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'intent_txns', label: 'Intent Txns' },
                { key: 'unique_users', label: 'Users' },
              ]}
            />
          )}
        </Card>

        <Card title="Intent Event Types (Mint / Burn / Transfer)">
          {daily.state === 'loading' && <ChartSkeleton />}
          {daily.state === 'error' && <ErrorBox message={daily.error!} />}
          {daily.state === 'success' && (
            <NearLineChart
              data={daily.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'mint_events', label: 'Mints' },
                { key: 'burn_events', label: 'Burns' },
                { key: 'transfer_events', label: 'Transfers' },
              ]}
            />
          )}
        </Card>

        <Card title="Top Tokens via Intents">
          {tokensRefs.state === 'loading' && <ChartSkeleton />}
          {tokensRefs.state === 'error' && <ErrorBox message={tokensRefs.error!} />}
          {tokensRefs.state === 'success' && (
            <DataTable
              rows={tokenRows}
              maxRows={15}
              columns={[
                { key: 'name', label: 'Token' },
                { key: 'event_count', label: 'Events', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_users', label: 'Users', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_txns', label: 'Txns', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>

        <Card title="Top Referrer dApps (Intent Routers)">
          {tokensRefs.state === 'loading' && <ChartSkeleton />}
          {tokensRefs.state === 'error' && <ErrorBox message={tokensRefs.error!} />}
          {tokensRefs.state === 'success' && (
            <DataTable
              rows={referrerRows}
              maxRows={15}
              columns={[
                { key: 'name', label: 'Referrer / dApp' },
                { key: 'event_count', label: 'Events', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_users', label: 'Users', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_txns', label: 'Txns', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
