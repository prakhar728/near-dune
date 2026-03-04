'use client'
import { useState, useEffect, useRef } from 'react'
import type { DuneRow } from './dune'
import { duneQueue } from './queue'

export type QueryState = 'idle' | 'loading' | 'success' | 'error'

export function useDuneQuery(queryId: number, timePeriod: string) {
  const [data, setData] = useState<DuneRow[]>([])
  const [state, setState] = useState<QueryState>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Show skeleton immediately — the queue will hold the actual HTTP call
    // until a rate-limit slot is free, transparently to the section components.
    setState('loading')
    setError(null)

    duneQueue
      .enqueue(
        () =>
          fetch(`/api/dune/${queryId}?time_period=${timePeriod}`, {
            signal: controller.signal,
          }),
        controller.signal,
      )
      .then((r) => r.json())
      .then((json: { error?: string; rows?: DuneRow[] }) => {
        if (json.error) throw new Error(json.error)
        setData(json.rows ?? [])
        setState('success')
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setState('error')
      })

    return () => controller.abort()
  }, [queryId, timePeriod])

  return { data, state, error }
}
