'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { RcmSegmented } from '@/components/ui/Rcm/RcmPrimitives'
import { ACTIVITY_FILTER_OPTIONS, ACTIVITY_TONE_CLASS, type ActivityFilter, type ActivityItem } from '@/demo/dashboard'
import { formatRelative } from '@/demo/engine'

const ALL_ACTIVITY_LIMIT = 5

export const AgentActivityFeed = ({ items }: { items: ActivityItem[] }) => {
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const filtered = useMemo(
    () => (filter === 'all' ? items.slice(0, ALL_ACTIVITY_LIMIT) : items.filter((a) => a.category === filter).slice(0, ALL_ACTIVITY_LIMIT)),
    [filter, items]
  )
  return (
    <div className="rounded-card border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border gap-2 flex-wrap">
        <div className="text-sm font-semibold">Agent activity</div>
        <RcmSegmented value={filter} onChange={setFilter} options={ACTIVITY_FILTER_OPTIONS} />
      </div>
      <div>
        {filtered.length > 0 ? (
          filtered.map((activity, index) => {
            const row = (
              <>
                <div className="w-5.5 flex justify-center pt-1.5 shrink-0">
                  <span className={`size-2 rounded-full ${ACTIVITY_TONE_CLASS[activity.tone]}`} />
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-pill-green-bg text-primary shrink-0">
                      <Sparkles className="size-2.5" />
                    </span>
                    <span className="font-medium">{activity.actor}</span>
                    <span className="text-muted-foreground">{activity.verb}</span>
                    <span className="font-mono">{activity.target}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{formatRelative(activity.at)}</span>
              </>
            )
            const cls = `flex items-start gap-3 px-4 py-2.5 ${index < filtered.length - 1 ? 'border-b border-border' : ''}`
            return activity.href ? (
              <Link key={activity.id} href={activity.href} className={`${cls} hover:bg-secondary/60`}>
                {row}
              </Link>
            ) : (
              <div key={activity.id} className={cls}>
                {row}
              </div>
            )
          })
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No activity for this filter</div>
        )}
      </div>
    </div>
  )
}
