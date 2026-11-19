'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { RcmBadge } from '@/components/ui/Rcm/RcmPrimitives'
import type { AttentionItem } from '@/demo/dashboard'

export const AttentionList = ({ items }: { items: AttentionItem[] }) => {
  const router = useRouter()
  return (
    <div className="rounded-card border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="text-sm font-semibold">Needs your attention</div>
        <Button variant="ghost" size="sm" href="/dashboard/notifications">
          View all
        </Button>
      </div>
      <div>
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing needs your attention.</div>
        ) : (
          items.map((t, i) => (
            <div key={t.key} className={`flex items-center gap-3 px-4 py-3 ${i < items.length - 1 ? 'border-b border-border' : ''}`}>
              <RcmBadge tone={t.tone} className="w-13 justify-center shrink-0">
                {t.time}
              </RcmBadge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.sub}</div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="size-6.5 shrink-0" aria-label={`Open ${t.title}`} onClick={() => router.push(t.href)}>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
