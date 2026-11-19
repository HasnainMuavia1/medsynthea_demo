import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/utils'
import type { SelectOption, SelectVariant } from './select.types'

export const selectBase = cn(
  'w-full min-w-0 max-w-full',
  'cursor-pointer touch-manipulation',
  'text-sm leading-normal',
  'transition-[border-color,box-shadow,background-color] duration-150 ease-out',
  'motion-reduce:transition-none',
  'focus-visible:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
  'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/30'
)

export const variantClasses: Record<SelectVariant, string> = {
  default: cn(
    'box-border h-9 min-h-9 rounded-md border border-border bg-background px-3 py-0',
    'hover:border-primary/25',
    'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50'
  ),
  admin: cn(
    'box-border h-9 min-h-9 rounded-md border border-border bg-background px-3 py-0',
    'hover:border-primary/25',
    'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50'
  ),
  toolbar: cn(
    'box-border h-9 min-h-9 rounded-md border border-border bg-background px-3 py-0',
    'hover:border-primary/25',
    'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50'
  ),
  pill: cn(
    'h-auto min-h-0 border-0 bg-transparent py-0 pl-0 pr-0',
    'w-full min-w-0',
    'text-3xs font-semibold uppercase tracking-wide text-foreground',
    'focus-visible:ring-0'
  ),
  compact: cn(
    'box-border h-8 min-h-8 rounded-md border border-border bg-background px-2.5 py-0',
    'text-2xs sm:text-xs font-medium text-foreground',
    'hover:border-primary/30',
    'focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20'
  ),
  compactInline: cn(
    'box-border h-8 min-h-8 rounded-md border border-border bg-background px-2 py-0',
    'text-2xs font-semibold text-primary',
    'focus-visible:ring-2 focus-visible:ring-primary/25'
  ),
}

export const listboxOptionClass =
  'px-3 py-2 text-sm text-left cursor-pointer flex items-start justify-between gap-2 min-w-0 w-full break-words'

export const resolveEmptyOptionLabel = (options: SelectOption[]): string | undefined => {
  return options.find((option) => option.value === '')?.label
}

export const resolveSelectedLabel = (
  value: string | number | readonly string[] | undefined,
  options: SelectOption[],
  placeholder?: string
): string | undefined => {
  if (value === undefined || value === '') {
    return placeholder ?? resolveEmptyOptionLabel(options)
  }
  const str = String(value)
  return options.find((o) => o.value === str)?.label ?? str
}

export const emitChange = (
  onChange: SelectHTMLAttributes<HTMLSelectElement>['onChange'],
  nextValue: string
) => {
  if (!onChange) return
  const event = {
    target: { value: nextValue },
    currentTarget: { value: nextValue },
  } as React.ChangeEvent<HTMLSelectElement>
  onChange(event)
}

export const filterSelectOptions = (options: SelectOption[], query: string): SelectOption[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return options
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(normalized) ||
      option.value.toLowerCase().includes(normalized)
  )
}

export const toggleMultiValue = (current: string[], nextValue: string): string[] => {
  if (current.includes(nextValue)) {
    return current.filter((value) => value !== nextValue)
  }
  return [...current, nextValue]
}

export const summarizeMultiSelection = (
  selectedLabels: string[],
  placeholder: string,
  selectedCountLabel: string,
  maxVisibleChips: number
): string => {
  if (selectedLabels.length === 0) return placeholder
  if (selectedLabels.length <= maxVisibleChips) return selectedLabels.join(', ')
  return `${selectedLabels.length} ${selectedCountLabel}`
}
