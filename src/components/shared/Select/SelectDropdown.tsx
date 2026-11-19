'use client'

import { createPortal } from 'react-dom'
import { useLayoutEffect, type UIEvent } from 'react'
import { Button } from '@/components/shared/Button'
import { Loader } from '@/components/shared/Loader'
import { Check } from 'lucide-react'
import { cn } from '@/utils'
import { SelectSearch } from './SelectSearch'
import type { SelectOption } from './select.types'
import { listboxOptionClass } from './select.utils'

const SCROLL_NEAR_END_PX = 40

export const SelectDropdown = ({
  open,
  listboxRef,
  listboxId,
  label,
  labelId,
  selectId,
  menuStyle,
  menuClassName,
  showPlaceholderOption,
  placeholder,
  placeholderDisabled,
  multiple,
  stringValue,
  selectedValues,
  options,
  selectableOptions,
  effectiveActiveIndex,
  searchable,
  searchId,
  searchQuery,
  searchPlaceholder,
  noResultsText,
  onSearchChange,
  onSearchKeyDown,
  onSelectValue,
  onSetActiveIndex,
  onMenuScrollNearEnd,
  menuLoading = false,
}: SelectDropdownProps) => {
  useLayoutEffect(() => {
    if (!open || searchable) return
    const listbox = listboxRef.current
    if (!listbox) return

    const selected = listbox.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
    if (!selected) return

    const listboxRect = listbox.getBoundingClientRect()
    const selectedRect = selected.getBoundingClientRect()
    const delta =
      selectedRect.top - listboxRect.top - (listbox.clientHeight - selectedRect.height) / 2
    listbox.scrollTop += delta
  }, [open, stringValue, selectedValues, listboxRef, searchable])

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    if (!onMenuScrollNearEnd) return
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - SCROLL_NEAR_END_PX) {
      onMenuScrollNearEnd()
    }
  }

  if (!open) return null

  const emptyLoading = options.length === 0 && menuLoading

  return createPortal(
    <ul
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      data-slot="select-listbox"
      aria-multiselectable={multiple || undefined}
      aria-labelledby={label ? labelId : selectId}
      aria-busy={menuLoading || undefined}
      style={menuStyle}
      className={cn(
        'max-h-72 overflow-y-auto overflow-x-hidden custom-scrollbar',
        'rounded-md border border-border bg-card text-foreground shadow-lg',
        'animate-in fade-in slide-in-from-top-1 duration-150 motion-reduce:animate-none',
        searchable ? 'py-0' : 'py-1',
        menuClassName
      )}
      onMouseDown={(event) => event.stopPropagation()}
      onScroll={handleScroll}
    >
      {searchable ? (
        <SelectSearch
          id={searchId}
          value={searchQuery}
          placeholder={searchPlaceholder}
          onChange={onSearchChange}
          onKeyDown={onSearchKeyDown}
        />
      ) : null}

      {showPlaceholderOption && !multiple ? (
        <li role="presentation">
          <Button
            type="button"
            variant="unstyled"
            size="auto"
            role="option"
            aria-selected={stringValue === ''}
            disabled={placeholderDisabled && stringValue !== ''}
            className={cn(
              listboxOptionClass,
              'h-auto justify-start rounded-none font-normal',
              'text-muted-foreground hover:bg-muted/80',
              stringValue === '' && 'bg-pill-green-bg text-primary'
            )}
            onClick={() => {
              if (!placeholderDisabled || stringValue === '') {
                onSelectValue('')
              }
            }}
          >
            <span className="min-w-0 flex-1">{placeholder}</span>
            {stringValue === '' && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
          </Button>
        </li>
      ) : null}

      {emptyLoading ? (
        <li className="flex items-center justify-center gap-2 px-3 py-3" role="presentation">
          <Loader variant="inline" size="tiny" className="gap-2" />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </li>
      ) : options.length === 0 ? (
        <li className="px-3 py-2.5 text-sm text-muted-foreground" role="presentation">
          {noResultsText}
        </li>
      ) : (
        options.map((opt) => {
          const selectableIndex = selectableOptions.findIndex((o) => o.value === opt.value)
          const isActive = selectableIndex === effectiveActiveIndex
          const isSelected = multiple ? selectedValues.has(opt.value) : stringValue === opt.value

          return (
            <li key={opt.value} role="presentation">
              <Button
                type="button"
                variant="unstyled"
                size="auto"
                role="option"
                id={`${listboxId}-option-${opt.value}`}
                aria-selected={isSelected}
                disabled={opt.disabled}
                title={opt.label}
                className={cn(
                  listboxOptionClass,
                  'h-auto justify-start rounded-none font-normal hover:bg-muted/80',
                  isSelected && 'bg-pill-green-bg text-primary font-medium',
                  isActive && !isSelected && 'bg-muted/50',
                  opt.disabled && 'pointer-events-none cursor-not-allowed opacity-50'
                )}
                onMouseEnter={() => {
                  if (!opt.disabled && selectableIndex >= 0) {
                    onSetActiveIndex(selectableIndex)
                  }
                }}
                onClick={() => !opt.disabled && onSelectValue(opt.value)}
              >
                <span className="min-w-0 flex-1 line-clamp-2">{opt.label}</span>
                {multiple ? (
                  <span
                    className={cn(
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background'
                    )}
                    aria-hidden
                  >
                    {isSelected ? <Check className="size-3 shrink-0" /> : null}
                  </span>
                ) : (
                  isSelected && (
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  )
                )}
              </Button>
            </li>
          )
        })
      )}
    </ul>,
    document.body
  )
}

export interface SelectDropdownProps {
  open: boolean
  listboxRef: React.RefObject<HTMLUListElement | null>
  listboxId: string
  label?: string
  labelId: string
  selectId: string
  menuStyle: React.CSSProperties
  menuClassName?: string
  showPlaceholderOption: boolean
  placeholder?: string
  placeholderDisabled: boolean
  multiple: boolean
  stringValue: string
  selectedValues: Set<string>
  options: SelectOption[]
  selectableOptions: SelectOption[]
  effectiveActiveIndex: number
  searchable: boolean
  searchId: string
  searchQuery: string
  searchPlaceholder: string
  noResultsText: string
  onSearchChange: (value: string) => void
  onSearchKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  onSelectValue: (nextValue: string) => void
  onSetActiveIndex: (index: number) => void
  onMenuScrollNearEnd?: () => void
  menuLoading?: boolean
}
