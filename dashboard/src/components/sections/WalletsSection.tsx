'use client'
import { motion } from 'framer-motion'
import { useDuneQuery } from '@/lib/useDuneQuery'
import { QUERY_IDS } from '@/lib/queryIds'
import { Card, StatCard } from '@/components/Card'
import { ChartSkeleton, ErrorBox } from '@/components/Skeleton'
import { NearLineChart } from '@/components/charts/NearLineChart'
import { NearBarChart } from '@/components/charts/NearBarChart'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export function WalletsSection({ timePeriod }: { timePeriod: string }) {
  const accounts = useDuneQuery(QUERY_IDS.newAccounts, timePeriod)
  const balDist = useDuneQuery(QUERY_IDS.balanceDistribution, timePeriod)

  const totalNew = accounts.data.reduce((s, r) => s + Number(r.unique_new_accounts ?? 0), 0)
  const peak = accounts.data.reduce((max, r) => Math.max(max, Number(r.unique_new_accounts ?? 0)), 0)

  return (
    <section>
      <h2 className="section-title">Wallets & Users</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="New Accounts Created" value={totalNew.toLocaleString()} />
        <StatCard label="Peak Daily Signups" value={peak.toLocaleString()} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily New Account Creations" syncedAt={accounts.syncedAt} onRefresh={accounts.refresh}>
          {accounts.state === 'loading' && <ChartSkeleton />}
          {accounts.state === 'error' && <ErrorBox message={accounts.error!} />}
          {accounts.state === 'success' && (
            <NearLineChart
              data={accounts.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'unique_new_accounts', label: 'New Accounts' },
                { key: 'unique_creators', label: 'Unique Creators' },
              ]}
            />
          )}
        </Card>

        <Card title="Account Balance Distribution (Current)" syncedAt={balDist.syncedAt} onRefresh={balDist.refresh}>
          {balDist.state === 'loading' && <ChartSkeleton />}
          {balDist.state === 'error' && <ErrorBox message={balDist.error!} />}
          {balDist.state === 'success' && (
            <NearBarChart
              data={balDist.data as object[]}
              xKey="balance_bucket"
              bars={[{ key: 'account_count', label: 'Accounts' }]}
              formatX={(v) => v}
              horizontal
            />
          )}
        </Card>
      </div>
    </section>
  )
}
