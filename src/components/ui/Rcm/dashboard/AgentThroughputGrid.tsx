'use client'

import Link from 'next/link'
import { ShieldCheck, Code2, Filter, AlertTriangle, Receipt } from 'lucide-react'
import { RcmBadge } from '@/components/ui/Rcm/RcmPrimitives'
import type { Throughput } from '@/demo/dashboard'

const ICONS: Record<string, React.ReactNode> = {
  eligibility: <ShieldCheck className="size-3.5" />,
  coding: <Code2 className="size-3.5" />,
  scrubbing: <Filter className="size-3.5" />,
  denial: <AlertTriangle className="size-3.5" />,
  eob: <Receipt className="size-3.5" />,
}

export const AgentThroughputGrid = ({ items, doneLabel }: { items: Throughput[]; doneLabel: string }) => (
  <div className="grid grid-cols-5 gap-3 mt-4">
    {items.map((c) => (
      <Link key={c.id} href={c.href} className="rounded-card border border-border bg-card p-4 flex flex-col gap-2.5 hover:shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground shrink-0">{ICONS[c.id]}</span>
            <span className="text-sm font-medium truncate">{c.label}</span>
          </div>
          {c.badge && <RcmBadge tone="red">{c.badge}</RcmBadge>}
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="text-2xs uppercase tracking-wide text-muted-foreground">{doneLabel}</div>
            <div className="font-mono text-2xl font-medium tabular-nums">{c.done}</div>
          </div>
          <div className="flex-1">
            <div className="text-2xs uppercase tracking-wide text-muted-foreground">In queue</div>
            <div className="font-mono text-2xl font-medium tabular-nums">{c.queue}</div>
          </div>
        </div>
      </Link>
    ))}
  </div>
)
