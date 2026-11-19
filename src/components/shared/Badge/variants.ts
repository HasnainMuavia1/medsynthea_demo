import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'
import { ui } from '@/styles/ui'

export const badgeVariants = cva(
  'box-border inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-md border-0 px-2 text-2xs font-medium leading-none whitespace-nowrap',
  {
    variants: {
      tone: ui.tone,
      density: {
        default: 'min-w-badge',
        fit: 'min-w-0',
      },
    },
    defaultVariants: {
      tone: 'gray',
      density: 'default',
    },
  }
)

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>
export type BadgeDensity = NonNullable<VariantProps<typeof badgeVariants>['density']>

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: ReactNode
  dot?: boolean
}
