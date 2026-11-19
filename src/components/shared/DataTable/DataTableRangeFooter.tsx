import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Select } from '@/components/shared/Select/Select'

export const DataTableRangeFooter = ({
  start,
  end,
  total,
  totalIsEstimate = false,
  page,
  pageCount,
  onPreviousPage,
  onNextPage,
  hasMore,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: DataTableRangeFooterProps) => {
  const showPagination =
    page !== undefined && pageCount !== undefined && onPreviousPage && onNextPage
  const showPageSize =
    Boolean(pageSizeOptions?.length) && pageSize !== undefined && Boolean(onPageSizeChange)
  const totalLabel = total.toLocaleString()
  const pageCountLabel = pageCount?.toLocaleString()
  const nextDisabled =
    hasMore !== undefined
      ? !hasMore
      : page !== undefined && pageCount !== undefined && page >= pageCount

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border bg-secondary px-4 py-2.5 text-xs text-muted-foreground">
      <span className="min-w-0">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{' '}
        {totalIsEstimate ? `~${totalLabel}` : totalLabel}
        {totalIsEstimate ? <span className="sr-only"> (approximate)</span> : null}
      </span>

      <div className="flex flex-wrap items-center gap-3">
        {showPageSize && pageSizeOptions && pageSize !== undefined && onPageSizeChange ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="shrink-0 whitespace-nowrap">Rows per page</span>
            <Select
              label="Rows per page"
              labelClassName="sr-only"
              variant="compact"
              searchable={false}
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 min-h-0 w-20 !overflow-visible rounded-md px-2.5 py-0 text-xs [&>span]:!overflow-visible [&>span]:text-clip [&>span]:whitespace-nowrap"
              wrapperClassName="!w-20 !min-w-20 !max-w-none shrink-0"
            />
          </div>
        ) : null}

        {showPagination ? (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={onPreviousPage}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="whitespace-nowrap">
              Page {page.toLocaleString()} of{' '}
              {totalIsEstimate ? `~${pageCountLabel}` : pageCountLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={onNextPage}
              disabled={nextDisabled}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export type DataTableRangeFooterProps = {
  start: number
  end: number
  total: number
  totalIsEstimate?: boolean
  page?: number
  pageCount?: number
  onPreviousPage?: () => void
  onNextPage?: () => void
  hasMore?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
}
