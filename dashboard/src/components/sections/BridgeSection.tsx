'use client'
import { motion } from 'framer-motion'
import { useDuneQuery } from '@/lib/useDuneQuery'
import { QUERY_IDS } from '@/lib/queryIds'
import { Card, StatCard } from '@/components/Card'
import { ChartSkeleton, ErrorBox } from '@/components/Skeleton'
import { NearBarChart } from '@/components/charts/NearBarChart'
import { DataTable } from '@/components/DataTable'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export function BridgeSection({ timePeriod }: { timePeriod: string }) {
  const daily = useDuneQuery(QUERY_IDS.bridgeDaily, timePeriod)
  const details = useDuneQuery(QUERY_IDS.bridgeTokensChains, timePeriod)

  const inbound = daily.data.filter((r) => r.direction === 'inbound')
  const outbound = daily.data.filter((r) => r.direction === 'outbound')
  const totalIn = inbound.reduce((s, r) => s + Number(r.bridge_txns ?? 0), 0)
  const totalOut = outbound.reduce((s, r) => s + Number(r.bridge_txns ?? 0), 0)

  const bridgePivot = (() => {
    const map: Record<string, { block_date: string; inbound: number; outbound: number }> = {}
    for (const r of daily.data) {
      const d = String(r.block_date)
      if (!map[d]) map[d] = { block_date: d, inbound: 0, outbound: 0 }
      if (r.direction === 'inbound') map[d].inbound += Number(r.bridge_txns ?? 0)
      else map[d].outbound += Number(r.bridge_txns ?? 0)
    }
    return Object.values(map).sort((a, b) => a.block_date.localeCompare(b.block_date))
  })()

  const tokenRows = details.data.filter((r) => r.dimension === 'token')
  const chainRows = details.data.filter((r) => r.dimension === 'chain')

  return (
    <section>
      <h2 className="section-title">Omni Bridge (Cross-Chain)</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Inbound Txns" value={totalIn.toLocaleString()} sub="into NEAR" />
        <StatCard label="Outbound Txns" value={totalOut.toLocaleString()} sub="from NEAR" />
        <StatCard label="Net Flow" value={(totalIn - totalOut).toLocaleString()} sub="inbound − outbound" />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily Bridge Volume (Inbound vs Outbound)" syncedAt={daily.syncedAt} onRefresh={daily.refresh}>
          {daily.state === 'loading' && <ChartSkeleton />}
          {daily.state === 'error' && <ErrorBox message={daily.error!} />}
          {daily.state === 'success' && (
            <NearBarChart
              data={bridgePivot as unknown as object[]}
              xKey="block_date"
              bars={[
                { key: 'inbound', label: 'Inbound', color: '#00C1DE' },
                { key: 'outbound', label: 'Outbound', color: '#9B5DE5' },
              ]}
              stacked
            />
          )}
        </Card>

        <Card title="Top Bridged Tokens" syncedAt={details.syncedAt} onRefresh={details.refresh}>
          {details.state === 'loading' && <ChartSkeleton />}
          {details.state === 'error' && <ErrorBox message={details.error!} />}
          {details.state === 'success' && (
            <DataTable
              rows={tokenRows}
              maxRows={15}
              columns={[
                { key: 'name', label: 'Token' },
                { key: 'bridge_txns', label: 'Total Txns', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'inbound_txns', label: 'Inbound', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'outbound_txns', label: 'Outbound', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>

        <Card title="Bridge by Chain" syncedAt={details.syncedAt} onRefresh={details.refresh}>
          {details.state === 'loading' && <ChartSkeleton />}
          {details.state === 'error' && <ErrorBox message={details.error!} />}
          {details.state === 'success' && (
            <DataTable
              rows={chainRows}
              maxRows={15}
              columns={[
                { key: 'name', label: 'Chain ID' },
                { key: 'bridge_txns', label: 'Total Txns', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'inbound_txns', label: 'Inbound', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'outbound_txns', label: 'Outbound', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_users', label: 'Users', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
