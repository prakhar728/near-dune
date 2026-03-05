import { NextRequest, NextResponse } from 'next/server'
import { fetchDuneQuery } from '@/lib/dune'
import { getCached, setCached } from '@/lib/cache'

export const maxDuration = 300 // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> }
) {
  const { queryId } = await params
  const id = parseInt(queryId)
  const timePeriod = request.nextUrl.searchParams.get('time_period') || '30D'
  const force = request.nextUrl.searchParams.get('force') === 'true'

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
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, rows: [] }, { status: 500 })
  }
}
