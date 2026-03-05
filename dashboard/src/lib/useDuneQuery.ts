'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { DuneRow } from './dune'
import { duneQueue } from './queue'

export type QueryState = 'idle' | 'loading' | 'success' | 'error'

export function useDuneQuery(queryId: number, timePeriod: string) {
  const [data, setData] = useState<DuneRow[]>([])
  const [state, setState] = useState<QueryState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchQuery = useCallback(
    (force = false) => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState('loading')
      setError(null)

      const url = `/api/dune/${queryId}?time_period=${timePeriod}${force ? '&force=true' : ''}`

      duneQueue
        .enqueue(() => fetch(url, { signal: controller.signal }), controller.signal)
        .then((r) => r.json())
        .then((json: { error?: string; rows?: DuneRow[]; syncedAt?: string }) => {
          if (json.error) throw new Error(json.error)
          setData(json.rows ?? [])
          setSyncedAt(json.syncedAt ?? null)
          setState('success')
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') return
          setError(err.message)
          setState('error')
        })

      return () => controller.abort()
    },
    [queryId, timePeriod]
  )

  useEffect(() => {
    const cleanup = fetchQuery(false)
    return cleanup
  }, [fetchQuery])

  const refresh = useCallback(() => {
    fetchQuery(true)
  }, [fetchQuery])

  return { data, state, error, syncedAt, refresh }
}
