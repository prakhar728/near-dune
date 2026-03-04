const DUNE_API_BASE = 'https://api.dune.com/api/v1'

export interface DuneRow {
  [key: string]: string | number | boolean | null
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Fetch wrapper that retries on 429 (rate limited) and transient 5xx errors.
 * Respects the Retry-After header when present; otherwise uses exponential backoff.
 * Max 6 retries (~2 min total wait in worst case).
 */
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 6): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options)

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After')
      // Retry-After is in seconds; fall back to exponential backoff with jitter
      const waitMs = retryAfter
        ? parseFloat(retryAfter) * 1000
        : Math.min(1_000 * 2 ** attempt + Math.random() * 500, 32_000)
      if (attempt < maxRetries) {
        await sleep(waitMs)
        continue
      }
      throw new Error(`Rate limited (429) after ${maxRetries} retries`)
    }

    // Retry transient server errors too
    if (res.status >= 500 && attempt < maxRetries) {
      await sleep(Math.min(1_000 * 2 ** attempt, 16_000))
      continue
    }

    return res
  }
  // unreachable but satisfies TS
  throw new Error('fetchWithRetry exhausted')
}

async function executeQuery(queryId: number, timePeriod: string): Promise<string> {
  const res = await fetchWithRetry(
    `${DUNE_API_BASE}/query/${queryId}/execute`,
    {
      method: 'POST',
      headers: {
        'X-Dune-API-Key': process.env.DUNE_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        performance: 'medium',
        query_parameters: { time_period: timePeriod },
      }),
    },
  )
  if (!res.ok) throw new Error(`Execute failed: ${res.status}`)
  const data = await res.json()
  return data.execution_id as string
}

async function getExecutionResults(executionId: string): Promise<{ state: string; rows?: DuneRow[] }> {
  // Poll endpoint is high-limit — still retry on 429 but with fewer retries
  const res = await fetchWithRetry(
    `${DUNE_API_BASE}/execution/${executionId}/results?limit=1000`,
    { headers: { 'X-Dune-API-Key': process.env.DUNE_API_KEY! } },
    4,
  )
  if (!res.ok) throw new Error(`Results fetch failed: ${res.status}`)
  const data = await res.json()
  return { state: data.state, rows: data.result?.rows ?? [] }
}

export async function fetchDuneQuery(queryId: number, timePeriod: string): Promise<DuneRow[]> {
  const executionId = await executeQuery(queryId, timePeriod)

  const maxWaitMs = 5 * 60 * 1000
  const start = Date.now()

  while (Date.now() - start < maxWaitMs) {
    await sleep(2_500)
    const { state, rows } = await getExecutionResults(executionId)
    if (state === 'QUERY_STATE_COMPLETED') return rows ?? []
    if (state === 'QUERY_STATE_FAILED' || state === 'QUERY_STATE_CANCELLED')
      throw new Error(`Query ${queryId} ended with state: ${state}`)
  }
  throw new Error(`Query ${queryId} timed out`)
}
