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

export function RevenueSection({ timePeriod }: { timePeriod: string }) {
  const revenue = useDuneQuery(QUERY_IDS.protocolRevenue, timePeriod)

  const totalBurned = revenue.data.reduce((s, r) => s + Number(r.near_burned ?? 0), 0)
  const totalProtocol = revenue.data.reduce((s, r) => s + Number(r.protocol_revenue_near ?? 0), 0)
  const totalValidators = revenue.data.reduce((s, r) => s + Number(r.validator_revenue_near ?? 0), 0)

  const fmt = (v: number) => {
    if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
    if (v >= 1e3) return (v / 1e3).toFixed(2) + 'K'
    return v.toFixed(2)
  }

  return (
    <section>
      <h2 className="section-title">Revenue & Fees</h2>
      <p className="section-subtitle">
        On NEAR, 70% of gas fees are burned (protocol revenue) and 30% go to validators.
      </p>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Total NEAR Burned" value={`${fmt(totalBurned)} Ⓝ`} />
        <StatCard label="Protocol Revenue (70%)" value={`${fmt(totalProtocol)} Ⓝ`} />
        <StatCard label="Validator Revenue (30%)" value={`${fmt(totalValidators)} Ⓝ`} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily NEAR Burned (Total Gas Fees)" syncedAt={revenue.syncedAt} onRefresh={revenue.refresh}>
          {revenue.state === 'loading' && <ChartSkeleton />}
          {revenue.state === 'error' && <ErrorBox message={revenue.error!} />}
          {revenue.state === 'success' && (
            <NearLineChart
              data={revenue.data as object[]}
              xKey="block_date"
              lines={[{ key: 'near_burned', label: 'NEAR Burned' }]}
              formatY={(v) => `${v.toFixed(2)} Ⓝ`}
            />
          )}
        </Card>

        <Card title="Protocol vs Validator Revenue Split" syncedAt={revenue.syncedAt} onRefresh={revenue.refresh}>
          {revenue.state === 'loading' && <ChartSkeleton />}
          {revenue.state === 'error' && <ErrorBox message={revenue.error!} />}
          {revenue.state === 'success' && (
            <NearLineChart
              data={revenue.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'protocol_revenue_near', label: 'Protocol (70%)' },
                { key: 'validator_revenue_near', label: 'Validators (30%)' },
              ]}
              formatY={(v) => `${v.toFixed(2)} Ⓝ`}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
