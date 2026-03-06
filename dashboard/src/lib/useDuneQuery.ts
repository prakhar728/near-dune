'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { DuneRow } from './dune'
import { duneQueue } from './queue'

export type QueryState = 'idle' | 'loading' | 'success' | 'error'

type ApiResponse = {
  error?: string
  rows?: DuneRow[]
  syncedAt?: string
  isStale?: boolean
}

export function useDuneQuery(queryId: number, timePeriod: string) {
  const [data, setData] = useState<DuneRow[]>([])
  const [state, setState] = useState<QueryState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bgAbortRef = useRef<AbortController | null>(null)

  const backgroundRefresh = useCallback((timePeriod: string) => {
    if (bgAbortRef.current) bgAbortRef.current.abort()
    const controller = new AbortController()
    bgAbortRef.current = controller

    setIsRefreshing(true)
    const url = `/api/dune/${queryId}?time_period=${timePeriod}&force=true`

    duneQueue
      .enqueue(() => fetch(url, { signal: controller.signal }), controller.signal)
      .then((r) => r.json())
      .then((json: ApiResponse) => {
        if (json.error) throw new Error(json.error)
        setData(json.rows ?? [])
        setSyncedAt(json.syncedAt ?? null)
      })
      .catch((err: Error) => { if (err.name !== 'AbortError') console.error(err) })
      .finally(() => { if (!controller.signal.aborted) setIsRefreshing(false) })
  }, [queryId])

  const fetchQuery = useCallback(
    (force = false) => {
      if (abortRef.current) abortRef.current.abort()
      if (bgAbortRef.current) bgAbortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState('loading')
      setError(null)
      setIsRefreshing(false)

      const url = `/api/dune/${queryId}?time_period=${timePeriod}${force ? '&force=true' : ''}`

      duneQueue
        .enqueue(() => fetch(url, { signal: controller.signal }), controller.signal)
        .then((r) => r.json())
        .then((json: ApiResponse) => {
          if (json.error) throw new Error(json.error)
          setData(json.rows ?? [])
          setSyncedAt(json.syncedAt ?? null)
          setState('success')
          if (json.isStale) backgroundRefresh(timePeriod)
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError') return
          setError(err.message)
          setState('error')
        })

      return () => controller.abort()
    },
    [queryId, timePeriod, backgroundRefresh]
  )

  useEffect(() => {
    const cleanup = fetchQuery(false)
    return () => { cleanup(); bgAbortRef.current?.abort() }
  }, [fetchQuery])

  const refresh = useCallback(() => {
    fetchQuery(true)
  }, [fetchQuery])

  return { data, state, error, syncedAt, isRefreshing, refresh }
}
