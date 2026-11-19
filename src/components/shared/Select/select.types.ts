import type { ChangeEventHandler, ReactNode, SelectHTMLAttributes } from 'react'

type SelectSharedProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'value' | 'onChange' | 'multiple'
> & {
  options: SelectOption[]
  label?: string
  labelClassName?: string
  leadingIcon?: ReactNode
  placeholder?: string
  placeholderDisabled?: boolean
  error?: string | boolean
  helperText?: string
  variant?: SelectVariant
  wrapperClassName?: string
  grow?: boolean
  hideChevron?: boolean
  menuClassName?: string
  searchable?: boolean
  searchPlaceholder?: string
  noResultsText?: string
  /** When false, menu options are not filtered by the search box (use with onSearchChange). */
  filterLocally?: boolean
  onSearchChange?: (query: string) => void
  /** Fired when the open listbox is scrolled near its bottom (infinite scroll). */
  onMenuScrollNearEnd?: () => void
  /** Show an inline loader inside the open listbox (fetch / search / load-more). */
  menuLoading?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export type SelectVariant = 'default' | 'admin' | 'toolbar' | 'pill' | 'compact' | 'compactInline'

export type SelectSingleProps = SelectSharedProps & {
  multiple?: false
  value?: string | number | readonly string[]
  onChange?: ChangeEventHandler<HTMLSelectElement>
}

export type SelectMultiProps = SelectSharedProps & {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
  selectedCountLabel?: string
  maxVisibleChips?: number
  /** When false, no chip row above the field — selection stays in the trigger/list. */
  showSelectionChips?: boolean
}

export type SelectProps = SelectSingleProps | SelectMultiProps
