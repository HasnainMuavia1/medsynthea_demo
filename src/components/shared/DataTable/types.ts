import { type ReactNode } from 'react'
import type { BadgeTone } from '@/components/shared/Badge'

export type SortState = { key: string; dir: 'asc' | 'desc' }

export type DataTableColumn<T> = {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  headerClassName?: string
  cellClassName?: string
  align?: 'left' | 'right'
  stopRowClick?: boolean
  headerAsTh?: boolean
}

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  onRowClick?: (row: T) => void
  isRowSelected?: (row: T) => boolean
  getRowClassName?: (row: T) => string | undefined
  selectable?: boolean
  selectedRows?: T[]
  onSelectedRowsChange?: (rows: T[]) => void
  emptyState?: ReactNode
  /** Backend or custom empty copy when `emptyState` is omitted. */
  emptyMessage?: string
  footer?: ReactNode
  panelHeader?: ReactNode
  className?: string
  bordered?: boolean
}

export type DataTableBadgeTone = BadgeTone
