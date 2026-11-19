import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils'
import { HEADER_CELL_CLASS } from './constants'
import type { SortState } from './types'

export const DataTableSortHead = ({
  label,
  sortKey,
  sort,
  onSort,
  align,
  className,
}: DataTableSortHeadProps) => {
  return (
    <th
      scope="col"
      className={cn(
        HEADER_CELL_CLASS,
        'cursor-pointer select-none',
        align === 'right' && 'text-right',
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <span
        className={cn('inline-flex items-center gap-1', align === 'right' && 'justify-end w-full')}
      >
        {label}
        {sort.key === sortKey &&
          (sort.dir === 'asc' ? (
            <ChevronUp className="size-2.5" />
          ) : (
            <ChevronDown className="size-2.5" />
          ))}
      </span>
    </th>
  )
}

export const DataTableHeaderCell = ({
  children,
  align,
  className,
}: {
  children?: ReactNode
  align?: 'left' | 'right'
  className?: string
}) => {
  return (
    <th scope="col" className={cn(HEADER_CELL_CLASS, align === 'right' && 'text-right', className)}>
      {children}
    </th>
  )
}

export const DataTablePanelHeader = ({
  title,
  meta,
  subtitle,
  className,
}: {
  title: string
  meta?: ReactNode
  subtitle?: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex min-h-13 flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary px-4 py-3.5',
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {meta ? <div className="shrink-0 text-xs text-muted-foreground">{meta}</div> : null}
    </div>
  )
}

export type DataTableSortHeadProps = {
  label: string
  sortKey: string
  sort: SortState
  onSort: (key: string) => void
  align?: 'left' | 'right'
  className?: string
}
