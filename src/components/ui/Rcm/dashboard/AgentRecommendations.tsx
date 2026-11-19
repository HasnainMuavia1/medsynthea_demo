'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { RcmBadge, ScoreRing } from '@/components/ui/Rcm/RcmPrimitives'
import type { Recommendation } from '@/demo/dashboard'

export const AgentRecommendations = ({ recs }: { recs: Recommendation[] }) => {
  const router = useRouter()
  const [refreshedAt, setRefreshedAt] = useState('just now')
  return (
    <div className="rounded-card border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-6 items-center justify-center rounded-md bg-pill-green-bg text-primary shrink-0">
            <Sparkles className="size-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">Agent recommendations</div>
            <div className="text-xs text-muted-foreground truncate">Pre-submission fixes · {refreshedAt}</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setRefreshedAt(`refreshed ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`)}>
          Refresh
        </Button>
      </div>
      <div className="flex flex-col">
        {recs.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No recommendations — every claim is clean.</div>
        ) : (
          recs.map((r, i) => (
            <Button
              key={r.key}
              type="button"
              variant="ghost"
              onClick={() => router.push(r.href)}
              className={`h-auto w-full justify-start gap-3 whitespace-normal rounded-none px-4 py-3 text-left hover:bg-secondary/80 ${i < recs.length - 1 ? 'border-b border-border' : ''}`}
            >
              <ScoreRing value={r.risk} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="font-mono">{r.ref}</span>
                  <RcmBadge tone={r.risk >= 70 ? 'red' : r.risk >= 40 ? 'yellow' : 'green'} density="fit" className="h-4 text-3xs">
                    {r.risk}% risk
                  </RcmBadge>
                </div>
                <div className="text-xs mt-0.5">{r.action}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.impact}</div>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
            </Button>
          ))
        )}
      </div>
    </div>
  )
}
