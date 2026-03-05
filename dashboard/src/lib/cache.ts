import { getSupabase } from './supabase'
import type { DuneRow } from './dune'

const TTL_MINUTES: Record<string, number> = {
  '24H': 10,
  '7D': 60,
  '30D': 180,
  '1Y': 720,
  'All Time': 1440,
}

export interface CachedResult {
  rows: DuneRow[]
  syncedAt: string
}

export async function getCached(queryId: number, timePeriod: string): Promise<CachedResult | null> {
  const ttl = TTL_MINUTES[timePeriod] ?? 60
  const cutoff = new Date(Date.now() - ttl * 60 * 1000).toISOString()

  try {
    const { data, error } = await getSupabase()
      .from('query_cache')
      .select('rows, synced_at')
      .eq('query_id', queryId)
      .eq('time_period', timePeriod)
      .gte('synced_at', cutoff)
      .maybeSingle()

    if (error) {
      console.error('[cache] getCached error:', error.message)
      return null
    }
    if (!data) return null

    return { rows: data.rows as DuneRow[], syncedAt: data.synced_at }
  } catch (err) {
    console.error('[cache] getCached threw:', err)
    return null
  }
}

export async function setCached(queryId: number, timePeriod: string, rows: DuneRow[]): Promise<string> {
  const syncedAt = new Date().toISOString()

  try {
    const { error } = await getSupabase().from('query_cache').upsert(
      { query_id: queryId, time_period: timePeriod, rows, synced_at: syncedAt },
      { onConflict: 'query_id,time_period' }
    )
    if (error) console.error('[cache] setCached error:', error.message)
  } catch (err) {
    console.error('[cache] setCached threw:', err)
  }

  return syncedAt
}
