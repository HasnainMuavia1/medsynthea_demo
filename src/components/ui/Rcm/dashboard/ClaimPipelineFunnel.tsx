'use client'

import { RcmCard, RcmSectionHeader } from '@/components/ui/Rcm/RcmLayout'
import { STAGE_COLOR_CLASS, fmtUSD, type FunnelRow } from '@/demo/dashboard'

export const ClaimPipelineFunnel = ({ rows, subtitle }: { rows: FunnelRow[]; subtitle: string }) => {
  const fMax = Math.max(...rows.map((f) => f.count), 1)
  return (
    <RcmCard>
      <RcmSectionHeader title="Claim Pipeline" subtitle={subtitle} />
      <div className="flex flex-col gap-1.5">
        {rows.map((s) => {
          const w = (s.count / fMax) * 100
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-30 text-xs text-muted-foreground shrink-0">{s.label}</div>
              <div className="relative flex-1 h-6 bg-secondary rounded overflow-hidden">
                <div className={`absolute inset-y-0 left-0 rounded ${STAGE_COLOR_CLASS[s.color]} opacity-[0.18]`} style={{ width: `${w}%` }} />
                <div className="absolute inset-0 flex items-center px-2.5 text-xs">
                  <span className="font-mono">{s.count}</span>
                </div>
              </div>
              <div className="w-20 text-right font-mono text-xs text-muted-foreground shrink-0">{fmtUSD(s.amount)}</div>
            </div>
          )
        })}
      </div>
    </RcmCard>
  )
}
