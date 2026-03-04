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

export function DAppsSection({ timePeriod }: { timePeriod: string }) {
  const topDapps = useDuneQuery(QUERY_IDS.topDapps, timePeriod)
  const methods = useDuneQuery(QUERY_IDS.topMethods, timePeriod)
  const deployments = useDuneQuery(QUERY_IDS.contractDeployments, timePeriod)
  const cex = useDuneQuery(QUERY_IDS.cexActivity, timePeriod)

  const totalDeployed = deployments.data.reduce((s, r) => s + Number(r.contracts_deployed ?? 0), 0)
  const totalDeployers = deployments.data.reduce((s, r) => s + Number(r.unique_deployers ?? 0), 0)

  return (
    <section>
      <h2 className="section-title">dApps & Smart Contracts</h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-5 mb-5 grid grid-cols-2 gap-3 md:grid-cols-3"
      >
        <StatCard label="Contracts Deployed" value={totalDeployed.toLocaleString()} />
        <StatCard label="Unique Deployers" value={totalDeployers.toLocaleString()} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily Contract Deployments">
          {deployments.state === 'loading' && <ChartSkeleton />}
          {deployments.state === 'error' && <ErrorBox message={deployments.error!} />}
          {deployments.state === 'success' && (
            <NearLineChart
              data={deployments.data as object[]}
              xKey="block_date"
              lines={[
                { key: 'contracts_deployed', label: 'Deployed' },
                { key: 'unique_deployers', label: 'Deployers' },
              ]}
            />
          )}
        </Card>

        <Card title="CEX Activity on NEAR">
          {cex.state === 'loading' && <ChartSkeleton />}
          {cex.state === 'error' && <ErrorBox message={cex.error!} />}
          {cex.state === 'success' && (
            <DataTable
              rows={cex.data}
              maxRows={15}
              columns={[
                { key: 'cex_name', label: 'Exchange' },
                { key: 'address', label: 'Address' },
                { key: 'total_transfer_events', label: 'Events', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>

        <Card title="Top dApps by Transaction Count" className="md:col-span-2">
          {topDapps.state === 'loading' && <ChartSkeleton />}
          {topDapps.state === 'error' && <ErrorBox message={topDapps.error!} />}
          {topDapps.state === 'success' && (
            <DataTable
              rows={topDapps.data}
              maxRows={20}
              columns={[
                { key: 'contract', label: 'Contract' },
                { key: 'txn_count', label: 'Transactions', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_users', label: 'Users', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_methods', label: 'Methods', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'near_fees_paid', label: 'Fees (Ⓝ)', align: 'right', format: (v) => Number(v).toFixed(4) },
              ]}
            />
          )}
        </Card>

        <Card title="Top Method Names Called" className="md:col-span-2">
          {methods.state === 'loading' && <ChartSkeleton />}
          {methods.state === 'error' && <ErrorBox message={methods.error!} />}
          {methods.state === 'success' && (
            <DataTable
              rows={methods.data}
              maxRows={20}
              columns={[
                { key: 'method_name', label: 'Method' },
                { key: 'call_count', label: 'Calls', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'unique_callers', label: 'Unique Callers', align: 'right', format: (v) => Number(v).toLocaleString() },
                { key: 'contracts_using_method', label: 'Contracts', align: 'right', format: (v) => Number(v).toLocaleString() },
              ]}
            />
          )}
        </Card>
      </div>
    </section>
  )
}
