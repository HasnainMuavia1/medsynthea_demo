import type { ReactNode } from 'react'
import { Badge, resolveActiveStatusTone } from '@/components/shared/Badge'
import type { DataTableBadgeTone } from './types'

export type { DataTableBadgeTone }

export const DataTableBadge = ({
  children,
  tone = 'gray',
  dot,
  className,
}: {
  children: ReactNode
  tone?: DataTableBadgeTone
  dot?: boolean
  className?: string
}) => {
  return (
    <Badge tone={tone} dot={dot} className={className}>
      {children}
    </Badge>
  )
}

export { resolveActiveStatusTone }
