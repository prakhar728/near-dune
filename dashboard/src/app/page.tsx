'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimePeriodSelector, TimePeriod } from '@/components/TimePeriodSelector'
import { NetworkSection } from '@/components/sections/NetworkSection'
import { RevenueSection } from '@/components/sections/RevenueSection'
import { WalletsSection } from '@/components/sections/WalletsSection'
import { SupplySection } from '@/components/sections/SupplySection'
import { StakingSection } from '@/components/sections/StakingSection'
import { TokensSection } from '@/components/sections/TokensSection'
import { NFTSection } from '@/components/sections/NFTSection'
import { IntentsSection } from '@/components/sections/IntentsSection'
import { BridgeSection } from '@/components/sections/BridgeSection'
import { DAppsSection } from '@/components/sections/DAppsSection'
import { StorageSection } from '@/components/sections/StorageSection'

const NAV = [
  { id: 'network', label: 'Network' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'supply', label: 'Supply' },
  { id: 'staking', label: 'Staking' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'intents', label: 'Intents' },
  { id: 'bridge', label: 'Bridge' },
  { id: 'dapps', label: 'dApps' },
  { id: 'storage', label: 'Storage' },
]

const SECTIONS: Record<string, React.FC<{ timePeriod: string }>> = {
  network: NetworkSection,
  revenue: RevenueSection,
  wallets: WalletsSection,
  supply: SupplySection,
  staking: StakingSection,
  tokens: TokensSection,
  nfts: NFTSection,
  intents: IntentsSection,
  bridge: BridgeSection,
  dapps: DAppsSection,
  storage: StorageSection,
}

export default function Home() {
  const [period, setPeriod] = useState<TimePeriod>('30D')
  const [activeTab, setActiveTab] = useState('network')

  const ActiveSection = SECTIONS[activeTab]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1A1A1A] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="10" fill="#00EC97" />
                  <path
                    d="M10 25V11l8 14V11M26 11v14"
                    stroke="#000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="absolute -inset-1 -z-10 rounded-xl bg-[#00EC97] opacity-15 blur-lg" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none tracking-tight text-white">
                  NEAR Analytics
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-[#666]">
                  Powered by Dune
                </p>
              </div>
            </div>
            <TimePeriodSelector value={period} onChange={setPeriod} />
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="sticky top-16 z-40 border-b border-[#1A1A1A] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="scroll-nav flex h-11 items-center gap-0.5 overflow-x-auto">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-pill relative ${activeTab === item.id ? 'active' : ''}`}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-[var(--near-green-soft)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Active Section Only */}
      <main className="mx-auto max-w-[1440px] px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${period}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ActiveSection timePeriod={period} />
          </motion.div>
        </AnimatePresence>

        <footer className="mt-16 border-t border-[#1A1A1A] pt-8 pb-12 text-center">
          <p className="text-[0.6875rem] text-[#444]">
            Data sourced from Dune Analytics · NEAR Protocol on-chain data
          </p>
        </footer>
      </main>
    </div>
  )
}
