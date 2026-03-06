import { NextRequest, NextResponse } from 'next/server'
import { fetchDuneQuery } from '@/lib/dune'
import { getCached, setCached } from '@/lib/cache'
import { QUERY_IDS } from '@/lib/queryIds'

export const maxDuration = 300 // 5 minutes

const ALLOWED_QUERY_IDS = new Set<number>(Object.values(QUERY_IDS))
const ALLOWED_TIME_PERIODS = new Set(['24H', '7D', '30D', '1Y', 'All Time'])

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> }
) {
  const { queryId } = await params
  const id = parseInt(queryId)
  const timePeriod = request.nextUrl.searchParams.get('time_period') || '30D'
  const force = request.nextUrl.searchParams.get('force') === 'true'

  if (!ALLOWED_QUERY_IDS.has(id)) {
    return NextResponse.json({ error: 'Invalid query', rows: [] }, { status: 400 })
  }

  if (!ALLOWED_TIME_PERIODS.has(timePeriod)) {
    return NextResponse.json({ error: 'Invalid time_period', rows: [] }, { status: 400 })
  }

  try {
    if (!force) {
      const cached = await getCached(id, timePeriod)
      if (cached) {
        return NextResponse.json({ rows: cached.rows, syncedAt: cached.syncedAt, fromCache: true })
      }
    }

    const rows = await fetchDuneQuery(id, timePeriod)
    const syncedAt = await setCached(id, timePeriod, rows)
    return NextResponse.json({ rows, syncedAt, fromCache: false })
  } catch (err) {
    console.error(`Dune query ${id} failed:`, err)
    return NextResponse.json({ error: 'Failed to fetch data', rows: [] }, { status: 500 })
  }
}
