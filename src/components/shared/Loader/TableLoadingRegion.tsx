import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { DataTableSkeleton } from '@/components/shared/DataTable/DataTableSkeleton'
import { useSustainedLoading } from '@/hooks/useDelayedLoading'
import { cn } from '@/utils'

interface TableLoadingRegionProps {
  isLoading: boolean
  /** Refetch from filters, paging, or other table ops — same skeleton as initial load */
  isRefreshing?: boolean
  /** Sustained async work (job polling) — compact status strip, never blocks */
  isPolling?: boolean
  label: string
  refreshLabel?: string
  pollingLabel?: string
  description?: string
  refreshDescription?: string
  /** Override default table-shaped skeleton */
  skeleton?: ReactNode
  skeletonColumns?: number
  skeletonRows?: number
  /** Applied on skeleton wrapper when a custom min height is still useful */
  minHeightClassName?: string
  className?: string
  children?: ReactNode
}

/**
 * Loader scoped to a table or list panel — not the full app shell.
 * Use useAppLoading only for mutations (AI, saves), not for table fetches.
 *
 * Modes:
 * - isLoading / isRefreshing → table skeleton immediately (never paint stale children)
 * - isPolling → inline spinner + status text above content (actions stay clickable)
 */
export const TableLoadingRegion = ({
  isLoading,
  isRefreshing = false,
  isPolling = false,
  label,
  refreshLabel,
  pollingLabel,
  description,
  refreshDescription,
  skeleton,
  skeletonColumns,
  skeletonRows,
  minHeightClassName,
  className,
  children,
}: TableLoadingRegionProps) => {
  const showPolling = useSustainedLoading(isPolling)
  const showSkeleton = (isLoading || isRefreshing) && !showPolling

  if (showSkeleton) {
    const statusLabel = isRefreshing
      ? refreshDescription
        ? `${refreshLabel ?? label}. ${refreshDescription}`
        : (refreshLabel ?? label)
      : description
        ? `${label}. ${description}`
        : label

    return (
      <div className={cn('relative w-full', minHeightClassName, className)}>
        {skeleton ?? (
          <DataTableSkeleton columns={skeletonColumns} rows={skeletonRows} label={statusLabel} />
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative w-full', className)} aria-busy={isPolling || undefined}>
      {showPolling ? (
        <div className="mb-3 flex items-center gap-2.5" role="status" aria-live="polite">
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm text-foreground">{pollingLabel ?? refreshLabel ?? label}</p>
            {refreshDescription || description ? (
              <p className="text-xs text-muted-foreground">{refreshDescription ?? description}</p>
            ) : null}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  )
}
