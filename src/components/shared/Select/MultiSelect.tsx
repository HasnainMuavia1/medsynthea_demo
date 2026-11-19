import { Select } from './Select'
import type { SelectOption, SelectMultiProps } from './select.types'

/** @deprecated Prefer `Select` with `multiple` (and optional `searchable`). */
/**
 * Multi-select dropdown. Thin wrapper around {@link Select} with `multiple`.
 * Prefer using `Select` directly going forward.
 */
export const MultiSelect = ({
  searchable = true,
  placeholder = 'Select options',
  ...props
}: MultiSelectProps) => {
  return <Select {...props} multiple searchable={searchable} placeholder={placeholder} />
}

export type MultiSelectOption = SelectOption

export type MultiSelectProps = Omit<SelectMultiProps, 'multiple'> & {
  searchable?: boolean
}
