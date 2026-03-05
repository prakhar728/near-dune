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

export function StorageSection({ timePeriod }: { timePeriod: string }) {
  const dist = useDuneQuery(QUERY_IDS.storageDistribution, timePeriod)
  const top = useDuneQuery(QUERY_IDS.topStorageAccounts, timePeriod)

  const totalGB = dist.data.reduce((s, r) => s + Number(r.total_storage_gb ?? 0), 0)
  const totalAccounts = dist.data.reduce((s, r) => s + Number(r.account_count ?? 0), 0)

  return (
    <section>
      <h2 className="section-title">Data Storage</h2>
      <p className="section-subtitle">
        On-chain storage is paid for in NEAR and measured in bytes per account.
      </p>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Total On-Chain Storage" value={`${totalGB.toFixed(3)} GB`} />
        <StatCard label="Accounts with Storage" value={totalAccounts.toLocaleString()} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Storage Distribution by Account (Current)" syncedAt={dist.syncedAt} onRefresh={dist.refresh}>
          {dist.state === 'loading' && <ChartSkeleton />}
          {dist.state === 'error' && <ErrorBox message={dist.error!} />}
          {dist.state === 'success' && (
            <NearBarChart
              data={dist.data as object[]}
              xKey="storage_bucket"
              bars={[{ key: 'account_count', label: 'Accounts' }]}
              formatX={(v) => v}
              horizontal
            />
          )}
        </Card>

        <Card title="Top Storage Consumers" syncedAt={top.syncedAt} onRefresh={top.refresh}>
          {top.state === 'loading' && <ChartSkeleton />}
          {top.state === 'error' && <ErrorBox message={top.error!} />}
          {top.state === 'success' && (
            <DataTable
              rows={top.data}
              maxRows={20}
              columns={[
                { key: 'account_id', label: 'Account' },
                { key: 'storage_mb', label: 'Storage (MB)', align: 'right', format: (v) => Number(v).toFixed(2) },
                { key: 'liquid_near', label: 'Liquid Ⓝ', align: 'right', format: (v) => Number(v).toFixed(2) },
                { key: 'staked_near', label: 'Staked Ⓝ', align: 'right', format: (v) => Number(v).toFixed(2) },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
