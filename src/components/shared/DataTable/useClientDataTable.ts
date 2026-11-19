'use client'

import { useMemo, useState } from 'react'
import type { SortState } from './types'

export const useClientDataTable = <T>({
  data,
  pageSize = 10,
  getSortValue,
  initialSort,
}: {
  data: T[]
  pageSize?: number
  getSortValue: (row: T, key: string) => string | number
  initialSort?: SortState
}) => {
  const [sort, setSort] = useState<SortState>(initialSort ?? { key: '', dir: 'asc' })
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sort.key) return data
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = getSortValue(a, sort.key)
      const bv = getSortValue(b, sort.key)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [data, getSortValue, sort])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const pageRows = sorted.slice(pageStart, pageStart + pageSize)

  const handleSort = (key: string) => {
    setSort((current) => ({
      key,
      dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

  return {
    rows: pageRows,
    sort,
    handleSort,
    page: currentPage,
    pageCount,
    rangeStart: sorted.length > 0 ? pageStart + 1 : 0,
    rangeEnd: Math.min(pageStart + pageSize, sorted.length),
    total: sorted.length,
    setPage,
  }
}
