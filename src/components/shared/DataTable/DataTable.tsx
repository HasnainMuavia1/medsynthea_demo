'use client'

import { cloneElement, isValidElement, useMemo } from 'react'
import { IndeterminateCheckbox } from '@/components/shared/Checkbox/IndeterminateCheckbox'
import { cn } from '@/utils'
import { BODY_CELL_CLASS, DATA_TABLE_DEFAULT_EMPTY_MESSAGE, HEADER_CELL_CLASS } from './constants'
import { DataTableHeaderCell } from './DataTableHeader'
import type { DataTableProps, DataTableColumn } from './types'

const ROW_CLASS = 'border-b border-border hover:bg-secondary/60 cursor-pointer transition-colors'
const ROW_SELECTED_CLASS = 'bg-pill-green-bg'

export const DataTable = <T,>({
  columns,
  data,
  getRowKey,
  onRowClick,
  isRowSelected,
  getRowClassName,
  selectable = false,
  selectedRows = [],
  onSelectedRowsChange,
  emptyState,
  emptyMessage,
  footer,
  panelHeader,
  className,
  bordered = true,
}: DataTableProps<T>) => {
  const selectedKeys = useMemo(
    () => new Set(selectedRows.map((row) => getRowKey(row))),
    [getRowKey, selectedRows]
  )

  const toggleRow = (row: T) => {
    if (!onSelectedRowsChange) return
    const key = getRowKey(row)
    if (selectedKeys.has(key)) {
      onSelectedRowsChange(selectedRows.filter((item) => getRowKey(item) !== key))
      return
    }
    onSelectedRowsChange([...selectedRows, row])
  }

  const toggleAll = () => {
    if (!onSelectedRowsChange) return
    if (selectedKeys.size === data.length && data.length > 0) {
      onSelectedRowsChange([])
      return
    }
    onSelectedRowsChange([...data])
  }

  const resolvedColumns: DataTableColumn<T>[] = selectable
    ? [
        {
          id: '__select',
          headerAsTh: true,
          header: (
            <th key="__select" scope="col" className={cn(HEADER_CELL_CLASS, 'w-10')}>
              <IndeterminateCheckbox
                checked={data.length > 0 && selectedKeys.size === data.length}
                indeterminate={selectedKeys.size > 0 && selectedKeys.size < data.length}
                onChange={toggleAll}
              />
            </th>
          ),
          stopRowClick: true,
          cell: (row: T) => (
            <IndeterminateCheckbox
              checked={selectedKeys.has(getRowKey(row))}
              onChange={() => toggleRow(row)}
            />
          ),
        },
        ...columns,
      ]
    : columns

  const resolvedEmptyState = emptyState ?? (
    <div className="px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">
        {emptyMessage?.trim() || DATA_TABLE_DEFAULT_EMPTY_MESSAGE}
      </p>
    </div>
  )

  return (
    <div
      className={cn(
        bordered && 'rounded-card border border-border bg-card overflow-hidden',
        'min-w-0 max-w-full',
        className
      )}
    >
      {panelHeader}
      <div className="@container max-w-full overflow-x-auto custom-scrollbar">
        <table data-slot="data-table" className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {resolvedColumns.map((column) => {
                if (column.headerAsTh) {
                  return isValidElement(column.header)
                    ? cloneElement(column.header, { key: column.id })
                    : column.header
                }
                if (typeof column.header === 'string') {
                  return (
                    <DataTableHeaderCell
                      key={column.id}
                      align={column.align}
                      className={column.headerClassName}
                    >
                      {column.header}
                    </DataTableHeaderCell>
                  )
                }
                return (
                  <th key={column.id} scope="col" className={column.headerClassName}>
                    {column.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={resolvedColumns.length}>{resolvedEmptyState}</td>
              </tr>
            ) : null}
            {data.map((row) => {
              const selected = isRowSelected?.(row) ?? false
              return (
                <tr
                  key={getRowKey(row)}
                  className={cn(
                    ROW_CLASS,
                    selected && ROW_SELECTED_CLASS,
                    getRowClassName?.(row),
                    !onRowClick && 'cursor-default'
                  )}
                  onClick={
                    onRowClick
                      ? (event) => {
                          const target = event.target as HTMLElement
                          if (target.closest('a, button, input, select, textarea, label')) return
                          onRowClick(row)
                        }
                      : undefined
                  }
                >
                  {resolvedColumns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        BODY_CELL_CLASS,
                        column.align === 'right' && 'text-right',
                        column.cellClassName
                      )}
                      onClick={column.stopRowClick ? (e) => e.stopPropagation() : undefined}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}
