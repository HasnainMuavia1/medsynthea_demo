import { cn } from '@/utils'
import { BODY_CELL_CLASS, HEADER_CELL_CLASS } from './constants'

const DEFAULT_COLUMNS = 4
const DEFAULT_ROWS = 8

const SkeletonBar = ({ className }: { className?: string }) => {
  return <div className={cn('h-3 rounded-md bg-muted animate-pulse', className)} aria-hidden />
}

export const DataTableSkeleton = ({
  columns = DEFAULT_COLUMNS,
  rows = DEFAULT_ROWS,
  showFooter = true,
  className,
  label = 'Loading',
}: DataTableSkeletonProps) => {
  const columnCount = Math.max(1, columns)

  return (
    <div
      className={cn(
        'min-w-0 max-w-full overflow-hidden rounded-card border border-border bg-card',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {Array.from({ length: columnCount }, (_, index) => (
                <th key={`skeleton-h-${index}`} scope="col" className={HEADER_CELL_CLASS}>
                  <SkeletonBar className={cn('h-2.5', index === 0 ? 'w-16' : 'w-12')} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={`skeleton-r-${rowIndex}`} className="border-b border-border last:border-b-0">
                {Array.from({ length: columnCount }, (_, colIndex) => (
                  <td key={`skeleton-c-${rowIndex}-${colIndex}`} className={BODY_CELL_CLASS}>
                    {colIndex === 0 ? (
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className="size-8 shrink-0 rounded-lg bg-muted animate-pulse"
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <SkeletonBar className="w-[72%] max-w-48" />
                          <SkeletonBar className="h-2.5 w-[48%] max-w-32" />
                        </div>
                      </div>
                    ) : colIndex === columnCount - 1 ? (
                      <SkeletonBar className="ml-auto h-2.5 w-10" />
                    ) : colIndex === columnCount - 2 ? (
                      <SkeletonBar className="h-5 w-14 rounded-full" />
                    ) : (
                      <SkeletonBar className="w-[70%] max-w-36" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showFooter ? (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-secondary/30 px-3 py-2.5">
          <SkeletonBar className="h-2.5 w-28" />
          <div className="flex items-center gap-2">
            <SkeletonBar className="h-8 w-16 rounded-md" />
            <SkeletonBar className="h-8 w-8 rounded-md" />
            <SkeletonBar className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export type DataTableSkeletonProps = {
  columns?: number
  rows?: number
  showFooter?: boolean
  className?: string
  label?: string
}
