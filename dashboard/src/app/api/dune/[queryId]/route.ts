import { NextRequest, NextResponse } from 'next/server'
import { fetchDuneQuery } from '@/lib/dune'

export const maxDuration = 300 // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> }
) {
  const { queryId } = await params
  const timePeriod = request.nextUrl.searchParams.get('time_period') || '30D'

  try {
    const rows = await fetchDuneQuery(parseInt(queryId), timePeriod)
    return NextResponse.json({ rows })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message, rows: [] }, { status: 500 })
  }
}
