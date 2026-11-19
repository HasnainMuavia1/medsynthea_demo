'use client'

import { Info } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { Tooltip } from '@/components/shared/Tooltip/Tooltip'
import { cn } from '@/utils'

export interface CodingCodeItem {
  code: string
  description: string
  units: number | null
  modifiers: string[]
  needsReview: boolean
  rationale: string | null
}

export const CodingCodeRow = ({ item, className }: { item: CodingCodeItem; className?: string }) => {
  const { code, description, units, modifiers, needsReview, rationale } = item
  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1', className)}>
      <span className="font-medium text-foreground">{code}</span>
      {units != null && units > 1 ? (
        <span className="text-xs text-muted-foreground" aria-label={`${units} units`}>
          ×{units}
        </span>
      ) : null}
      {modifiers.map((modifier) => (
        <Badge key={modifier} tone="gray" density="fit" className="px-1.5">
          {modifier}
        </Badge>
      ))}
      {needsReview ? (
        <Tooltip content="Confidence below 90% — needs coder review before billing." tabIndex={0} aria-label={`Review needed for ${code}`} containerClassName="rounded-md focus-visible:ring-2 focus-visible:ring-primary/50">
          <Badge tone="yellow" density="fit">
            Review
          </Badge>
        </Tooltip>
      ) : null}
      {rationale ? (
        <Tooltip content={rationale} tabIndex={0} aria-label={`Rationale for ${code}`} containerClassName="rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50">
          <Info className="size-3.5" aria-hidden />
        </Tooltip>
      ) : null}
      {description ? <span className="min-w-0 text-muted-foreground">— {description}</span> : null}
    </div>
  )
}
