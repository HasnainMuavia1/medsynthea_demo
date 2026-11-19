'use client'

import { useEffect } from 'react'
import { useDemoStore } from '@/demo/store'
import type { DemoCase } from '@/demo/types'

const DELAYS_MS = [3500, 4000, 4500, 5000, 4000, 3000]

const lastEventAt = (c: DemoCase): number => {
  const stamps = [
    c.eob?.receivedAt,
    c.era?.receivedAt,
    c.statusEvents[c.statusEvents.length - 1]?.at,
    c.claim?.submittedAt,
    c.denial?.resolvedAt,
    c.arCalls[0]?.startedAt,
  ]
    .filter((v): v is string => Boolean(v))
    .map((v) => new Date(v).getTime())
  return stamps.length ? Math.max(...stamps) : Date.now()
}

const stageIndex = (c: DemoCase): number => c.statusEvents.length + (c.era ? 1 : 0) + (c.eob ? 1 : 0)

export const useClaimStatusSimulator = () => {
  useEffect(() => {
    const timer = window.setInterval(() => {
      const { cases, advanceStatus } = useDemoStore.getState()
      cases.forEach((c) => {
        if (!c.claim?.liveTracking || !c.claim.submittedAt || c.eob || (c.denial && !c.denial.resolvedAt)) return
        const delay = DELAYS_MS[Math.min(stageIndex(c), DELAYS_MS.length - 1)]
        if (Date.now() - lastEventAt(c) >= delay) advanceStatus(c.id)
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])
}
