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

export function NFTSection({ timePeriod }: { timePeriod: string }) {
  const daily = useDuneQuery(QUERY_IDS.nftDailyActivity, timePeriod)
  const top = useDuneQuery(QUERY_IDS.topNftCollections, timePeriod)

  const totalTransfers = daily.data.reduce((s, r) => s + Number(r.transfer_count ?? 0), 0)
  const totalBuyers = daily.data.reduce((s, r) => s + Number(r.unique_buyers ?? 0), 0)
  const totalMints = daily.data.reduce((s, r) => s + Number(r.mint_count ?? 0), 0)

  return (
    <section>
      <h2 className="section-title">NFTs</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Total NFT Transfers" value={totalTransfers.toLocaleString()} />
        <StatCard label="Cumulative Buyers" value={totalBuyers.toLocaleString()} />
        <StatCard label="Total NFT Mints" value={totalMints.toLocaleString()} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily NFT Transfers & Unique Buyers">
          {daily.state === 'loading' && <ChartSkeleton />}
          {daily.state === 'error' && <ErrorBox message={daily.error!} />}
          {daily.state === 'success' && (
            <NearLineChart
              data={daily.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'transfer_count', label: 'Transfers' },
                { key: 'unique_buyers', label: 'Buyers' },
                { key: 'unique_sellers', label: 'Sellers' },
              ]}
            />
          )}
        </Card>

        <Card title="Active Collections & Daily Mints">
          {daily.state === 'loading' && <ChartSkeleton />}
          {daily.state === 'error' && <ErrorBox message={daily.error!} />}
          {daily.state === 'success' && (
            <NearLineChart
              data={daily.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'active_collections', label: 'Active Collections' },
                { key: 'mint_count', label: 'Mints' },
              ]}
            />
          )}
        </Card>

        <Card title="Top NFT Collections" className="md:col-span-2">
          {top.state === 'loading' && <ChartSkeleton />}
          {top.state === 'error' && <ErrorBox message={top.error!} />}
          {top.state === 'success' && (
            <DataTable
              rows={top.data}
              maxRows={20}
              columns={[
                { key: 'collection', label: 'Collection' },
                { key: 'transfer_count', label: 'Transfers', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_buyers', label: 'Buyers', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_sellers', label: 'Sellers', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_tokens_traded', label: 'Unique NFTs', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
