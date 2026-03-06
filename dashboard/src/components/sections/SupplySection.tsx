'use client'
import { motion } from 'framer-motion'
import { useDuneQuery } from '@/lib/useDuneQuery'
import { QUERY_IDS } from '@/lib/queryIds'
import { Card, StatCard } from '@/components/Card'
import { ChartSkeleton, ErrorBox } from '@/components/Skeleton'
import { NearLineChart } from '@/components/charts/NearLineChart'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export function SupplySection({ timePeriod }: { timePeriod: string }) {
  const supply = useDuneQuery(QUERY_IDS.circulatingSupply, timePeriod)

  const latest = supply.data[supply.data.length - 1]
  const fmt = (v: number) => {
    if (v >= 1e9) return (v / 1e9).toFixed(3) + 'B'
    if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
    return v.toFixed(0)
  }

  return (
    <section>
      <h2 className="section-title">Token Supply & Economics</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Circulating Supply" value={latest ? `${fmt(Number(latest.circulating_near))} Ⓝ` : '...'} />
        <StatCard label="Total Supply" value={latest ? `${fmt(Number(latest.total_near))} Ⓝ` : '...'} />
        <StatCard label="Circulating %" value={latest ? `${Number(latest.circulating_pct).toFixed(2)}%` : '...'} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Circulating vs Total Supply" syncedAt={supply.syncedAt} onRefresh={supply.refresh} isRefreshing={supply.isRefreshing}>
          {supply.state === 'loading' && <ChartSkeleton />}
          {supply.state === 'error' && <ErrorBox message={supply.error!} />}
          {supply.state === 'success' && (
            <NearLineChart
              data={supply.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'circulating_near', label: 'Circulating' },
                { key: 'total_near', label: 'Total Supply' },
              ]}
              formatY={(v) => `${fmt(v)} Ⓝ`}
            />
          )}
        </Card>

        <Card title="Circulating % of Total Supply" syncedAt={supply.syncedAt} onRefresh={supply.refresh} isRefreshing={supply.isRefreshing}>
          {supply.state === 'loading' && <ChartSkeleton />}
          {supply.state === 'error' && <ErrorBox message={supply.error!} />}
          {supply.state === 'success' && (
            <NearLineChart
              data={supply.data as object[]}
              xKey="block_date"
              lines={[{ key: 'circulating_pct', label: 'Circulating %' }]}
              formatY={(v) => `${v.toFixed(2)}%`}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
