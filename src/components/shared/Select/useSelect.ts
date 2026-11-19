import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useAppDialogHostOpen } from '@/components/shared/Dialog/AppDialog'
import { useDropdownMenu } from '@/hooks/useDropdownMenu'
import { handleSelectKeyDown } from './select-keyboard'
import type { SelectProps } from './select.types'
import {
  emitChange,
  filterSelectOptions,
  resolveEmptyOptionLabel,
  resolveSelectedLabel,
  summarizeMultiSelection,
  toggleMultiValue,
} from './select.utils'

export const useSelect = (props: SelectProps) => {
  const {
    options,
    placeholder,
    placeholderDisabled = true,
    error,
    helperText,
    variant = 'default',
    hideChevron = false,
    id: idProp,
    disabled,
    searchable = true,
    searchPlaceholder = 'Search…',
    noResultsText = 'No options found',
    filterLocally = true,
    onSearchChange,
    onMenuScrollNearEnd,
    menuLoading = false,
    onBlur,
    'aria-invalid': ariaInvalidProp,
    'aria-describedby': ariaDescribedByProp,
  } = props

  const multiple = props.multiple === true
  const valueProp = props.value
  const multiValue = useMemo((): string[] => {
    if (!multiple) return []
    return Array.isArray(valueProp) ? [...valueProp] : []
  }, [multiple, valueProp])
  const maxVisibleChips = (multiple ? props.maxVisibleChips : undefined) ?? 3
  const selectedCountLabel = (multiple ? props.selectedCountLabel : undefined) ?? 'selected'
  const showSelectionChips = multiple ? (props.showSelectionChips ?? true) : false

  const generatedId = useId()
  const selectId = idProp ?? generatedId
  const labelId = `${selectId}-label`
  const listboxId = `${selectId}-listbox`
  const searchId = `${selectId}-search`
  const feedbackId =
    (typeof error === 'string' ? error : undefined) || helperText
      ? `${selectId}-feedback`
      : undefined

  const containerRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [searchQuery, setSearchQuery] = useState('')
  const dialogHostOpen = useAppDialogHostOpen()
  if (!dialogHostOpen && open) {
    setOpen(false)
    setActiveIndex(-1)
    setSearchQuery('')
  }
  const menuOpen = open && dialogHostOpen

  const stringValue =
    !multiple && props.value !== undefined && props.value !== null ? String(props.value) : ''
  const selectedValues = useMemo(
    () => new Set(multiple ? multiValue : stringValue ? [stringValue] : []),
    [multiple, multiValue, stringValue]
  )
  const showPlaceholderOption =
    !multiple && placeholder !== undefined && (placeholderDisabled ? stringValue === '' : true)
  // When the placeholder row is visible, drop value:'' options so "All …" isn't listed twice.
  const menuOptions = useMemo(() => {
    if (!showPlaceholderOption) return options
    return options.filter((option) => option.value !== '')
  }, [options, showPlaceholderOption])
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.has(option.value)),
    [options, selectedValues]
  )
  const selectedOption =
    !multiple && stringValue !== ''
      ? options.find((option) => option.value === stringValue)
      : undefined
  const visibleOptions = useMemo(
    () =>
      searchable && filterLocally ? filterSelectOptions(menuOptions, searchQuery) : menuOptions,
    [filterLocally, menuOptions, searchable, searchQuery]
  )

  useEffect(() => {
    onSearchChange?.(searchQuery)
  }, [onSearchChange, searchQuery])
  const selectableOptions = useMemo(
    () => visibleOptions.filter((option) => !option.disabled),
    [visibleOptions]
  )

  const selectedLabels = selectedOptions.map((option) => option.label)
  const emptyOptionLabel = resolveEmptyOptionLabel(options)
  const unresolvedPlaceholder = placeholder ?? emptyOptionLabel
  const displayLabel = multiple
    ? selectedLabels.length === 0
      ? (unresolvedPlaceholder ?? 'Select options')
      : summarizeMultiSelection(
          selectedLabels,
          unresolvedPlaceholder ?? 'Select options',
          selectedCountLabel,
          maxVisibleChips
        )
    : (selectedOption?.label ?? (stringValue ? stringValue : (unresolvedPlaceholder ?? '')))
  const selectedTitle = multiple
    ? selectedLabels.join(', ') || unresolvedPlaceholder
    : resolveSelectedLabel(props.value, options, placeholder)

  const initialActiveIndex = (() => {
    if (multiple) {
      const firstSelected = selectableOptions.findIndex((option) =>
        selectedValues.has(option.value)
      )
      return firstSelected >= 0 ? firstSelected : 0
    }
    const selectedIdx = selectableOptions.findIndex((option) => option.value === stringValue)
    return selectedIdx >= 0 ? selectedIdx : 0
  })()
  const effectiveActiveIndex =
    activeIndex >= 0 && activeIndex < selectableOptions.length ? activeIndex : initialActiveIndex

  const close = useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
    setSearchQuery('')
    onBlur?.({
      target: { value: multiple ? multiValue.join(',') : stringValue },
    } as React.FocusEvent<HTMLSelectElement>)
  }, [multiple, multiValue, onBlur, stringValue])

  const { menuStyle } = useDropdownMenu({
    open: menuOpen,
    onClose: close,
    containerRef,
    listboxRef,
  })

  const selectValue = useCallback(
    (nextValue: string) => {
      if (props.multiple === true) {
        props.onChange(toggleMultiValue(multiValue, nextValue))
        return
      }
      emitChange(props.onChange, nextValue)
      setOpen(false)
      setActiveIndex(-1)
      setSearchQuery('')
    },
    [multiValue, props]
  )

  const removeValue = useCallback(
    (nextValue: string) => {
      if (props.multiple !== true) return
      props.onChange(multiValue.filter((value) => value !== nextValue))
    },
    [multiValue, props]
  )

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      if (prev) {
        setActiveIndex(-1)
        setSearchQuery('')
      } else {
        setActiveIndex(initialActiveIndex)
      }
      return !prev
    })
  }, [initialActiveIndex])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setActiveIndex(0)
  }, [])

  const runKeyboard = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
      handleSelectKeyDown(event, {
        disabled,
        open: menuOpen,
        multiple,
        initialActiveIndex,
        effectiveActiveIndex,
        selectableOptions,
        setOpen,
        setActiveIndex,
        selectValue,
        close,
      })
    },
    [
      disabled,
      menuOpen,
      multiple,
      initialActiveIndex,
      effectiveActiveIndex,
      selectableOptions,
      selectValue,
      close,
    ]
  )

  return {
    selectId,
    labelId,
    listboxId,
    searchId,
    feedbackId,
    containerRef,
    listboxRef,
    menuOpen,
    menuStyle,
    isError: Boolean(error),
    errorMessage: typeof error === 'string' ? error : undefined,
    showChevron: !hideChevron && variant !== 'pill',
    useAdminLabel: Boolean(props.label) && variant === 'admin',
    variant,
    searchable,
    searchPlaceholder,
    noResultsText,
    searchQuery,
    stringValue,
    selectedValues,
    selectedOptions,
    selectedOption,
    menuOptions,
    displayLabel,
    selectedTitle,
    resolvedPlaceholder: unresolvedPlaceholder,
    visibleOptions,
    selectableOptions,
    effectiveActiveIndex,
    showPlaceholderOption,
    placeholderDisabled,
    ariaInvalidProp,
    ariaDescribedByProp,
    multiple,
    showSelectionChips,
    toggleOpen,
    selectValue,
    removeValue,
    setActiveIndex,
    handleSearchChange,
    handleKeyDown: runKeyboard as React.KeyboardEventHandler<HTMLButtonElement>,
    handleSearchKeyDown: runKeyboard as React.KeyboardEventHandler<HTMLInputElement>,
    onMenuScrollNearEnd,
    menuLoading,
  }
}
