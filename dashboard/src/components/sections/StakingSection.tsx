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

export function StakingSection({ timePeriod }: { timePeriod: string }) {
  const staking = useDuneQuery(QUERY_IDS.stakingOverTime, timePeriod)
  const validators = useDuneQuery(QUERY_IDS.topValidators, timePeriod)

  const latest = staking.data[staking.data.length - 1]
  const fmt = (v: number) => {
    if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
    if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
    return v.toFixed(2)
  }

  return (
    <section>
      <h2 className="section-title">Staking & Validators</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatCard label="Total Staked" value={latest ? `${fmt(Number(latest.total_staked_near))} Ⓝ` : '...'} />
        <StatCard label="Total Liquid" value={latest ? `${fmt(Number(latest.total_liquid_near))} Ⓝ` : '...'} />
        <StatCard label="Total Rewards" value={latest ? `${fmt(Number(latest.total_rewards_near))} Ⓝ` : '...'} />
        <StatCard label="Staked %" value={latest ? `${Number(latest.staked_pct_of_total).toFixed(2)}%` : '...'} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Staked vs Liquid NEAR Over Time" syncedAt={staking.syncedAt} onRefresh={staking.refresh}>
          {staking.state === 'loading' && <ChartSkeleton />}
          {staking.state === 'error' && <ErrorBox message={staking.error!} />}
          {staking.state === 'success' && (
            <NearLineChart
              data={staking.data as object[]}
              xKey="epoch_date"
              lines={[
                { key: 'total_staked_near', label: 'Staked' },
                { key: 'total_liquid_near', label: 'Liquid' },
                { key: 'total_unstaking_near', label: 'Unstaking' },
              ]}
              formatY={(v) => `${fmt(v)} Ⓝ`}
            />
          )}
        </Card>

        <Card title="Top Validators by Chunks Produced" syncedAt={validators.syncedAt} onRefresh={validators.refresh}>
          {validators.state === 'loading' && <ChartSkeleton />}
          {validators.state === 'error' && <ErrorBox message={validators.error!} />}
          {validators.state === 'success' && (
            <DataTable
              rows={validators.data}
              maxRows={15}
              columns={[
                { key: 'validator', label: 'Validator' },
                { key: 'chunks_produced', label: 'Chunks', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'share_pct', label: 'Share %', align: 'right', format: (v) => `${Number(v).toFixed(3)}%` },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
