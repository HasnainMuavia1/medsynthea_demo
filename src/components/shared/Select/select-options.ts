import type { SelectOption } from './select.types'

export const mapToSelectOptions = <T>(
  items: readonly T[],
  config: {
    value: (item: T) => string
    label: (item: T) => string
    disabled?: (item: T) => boolean
  }
): SelectOption[] => {
  return items.map((item) => ({
    value: config.value(item),
    label: config.label(item),
    disabled: config.disabled?.(item),
  }))
}
