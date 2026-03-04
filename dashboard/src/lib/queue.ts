'use client'

/**
 * Client-side rate-limited request queue.
 *
 * Dune API rate limits (execute endpoint = "low limit"):
 *   Free:       15 rpm  → minIntervalMs 4 500, maxConcurrent 1
 *   Plus:       70 rpm  → minIntervalMs   900, maxConcurrent 4
 *   Enterprise: 350 rpm → minIntervalMs   200, maxConcurrent 8
 *
 * We target ~80 % of each limit to keep a safe buffer.
 * Set NEXT_PUBLIC_DUNE_PLAN=free|plus|enterprise in .env.local
 */

const PLAN_SETTINGS = {
  free:       { maxConcurrent: 1, minIntervalMs: 4_500 },
  plus:       { maxConcurrent: 4, minIntervalMs:   950 },
  enterprise: { maxConcurrent: 8, minIntervalMs:   200 },
} as const

type Plan = keyof typeof PLAN_SETTINGS

const plan = (
  (typeof window !== 'undefined'
    ? (window as unknown as Record<string, string>).__DUNE_PLAN__
    : undefined) ??
  process.env.NEXT_PUBLIC_DUNE_PLAN ??
  'plus'
) as Plan

const { maxConcurrent, minIntervalMs } = PLAN_SETTINGS[plan] ?? PLAN_SETTINGS.plus

type QueueEntry = {
  run: () => Promise<void>
  abort: () => void
}

class RateLimitedQueue {
  private queue: QueueEntry[] = []
  private active = 0
  private lastFiredAt = 0

  enqueue<T>(fn: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const entry: QueueEntry = {
        run: async () => {
          if (signal?.aborted) { reject(abortError()); return }

          // Enforce minimum interval between consecutive fires
          const gap = minIntervalMs - (Date.now() - this.lastFiredAt)
          if (gap > 0) await sleep(gap)

          if (signal?.aborted) { reject(abortError()); return }

          this.lastFiredAt = Date.now()
          try { resolve(await fn()) } catch (e) { reject(e) }
        },
        abort: () => reject(abortError()),
      }

      // If already aborted, skip queue entirely
      if (signal?.aborted) { reject(abortError()); return }

      signal?.addEventListener('abort', () => {
        const idx = this.queue.indexOf(entry)
        if (idx !== -1) { this.queue.splice(idx, 1); entry.abort() }
      })

      this.queue.push(entry)
      this.tick()
    })
  }

  private async tick() {
    if (this.active >= maxConcurrent || this.queue.length === 0) return
    const entry = this.queue.shift()!
    this.active++
    try { await entry.run() } finally { this.active--; this.tick() }
  }

  get queueLength() { return this.queue.length }
  get activeCount() { return this.active }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const abortError = () => Object.assign(new Error('Aborted'), { name: 'AbortError' })

// Single global queue shared across all useDuneQuery hooks on the page
export const duneQueue = new RateLimitedQueue()
export { plan as currentPlan, maxConcurrent, minIntervalMs }
