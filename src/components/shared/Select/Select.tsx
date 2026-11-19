'use client'

import { forwardRef, useCallback, useRef } from 'react'
import { SelectControl } from './SelectControl'
import { SelectFeedback, SelectField } from './SelectField'
import type { SelectMultiProps, SelectProps, SelectSingleProps } from './select.types'
import { useSelect } from './useSelect'

export type {
  SelectOption,
  SelectProps,
  SelectMultiProps,
  SelectSingleProps,
  SelectVariant,
} from './select.types'

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const {
    label,
    labelClassName,
    leadingIcon,
    helperText,
    wrapperClassName,
    grow = false,
    menuClassName,
    className,
    disabled,
    required,
    name,
  } = props

  const state = useSelect(props)
  const hiddenSelectRef = useRef<HTMLSelectElement>(null)

  const setRefs = useCallback(
    (node: HTMLSelectElement | null) => {
      hiddenSelectRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )

  const selectElement = (
    <SelectControl
      containerRef={state.containerRef}
      selectId={state.selectId}
      labelId={state.labelId}
      listboxId={state.listboxId}
      label={label}
      leadingIcon={leadingIcon}
      disabled={disabled}
      required={required}
      name={name}
      open={state.menuOpen}
      grow={grow}
      variant={state.variant}
      showChevron={state.showChevron}
      isError={state.isError}
      className={className}
      menuClassName={menuClassName}
      ariaInvalidProp={state.ariaInvalidProp}
      ariaDescribedByProp={state.ariaDescribedByProp}
      feedbackId={state.feedbackId}
      selectedTitle={state.selectedTitle}
      displayLabel={state.displayLabel}
      selectedOption={state.selectedOption}
      multiple={state.multiple}
      showSelectionChips={state.showSelectionChips}
      selectedOptions={state.selectedOptions}
      placeholder={state.resolvedPlaceholder}
      placeholderDisabled={state.placeholderDisabled}
      stringValue={state.stringValue}
      selectedValues={state.selectedValues}
      options={state.menuOptions}
      visibleOptions={state.visibleOptions}
      selectableOptions={state.selectableOptions}
      effectiveActiveIndex={state.effectiveActiveIndex}
      showPlaceholderOption={state.showPlaceholderOption}
      searchable={state.searchable}
      searchId={state.searchId}
      searchQuery={state.searchQuery}
      searchPlaceholder={state.searchPlaceholder}
      noResultsText={state.noResultsText}
      menuStyle={state.menuStyle}
      listboxRef={state.listboxRef}
      setRefs={setRefs}
      onToggleOpen={state.toggleOpen}
      onKeyDown={state.handleKeyDown}
      onSearchKeyDown={state.handleSearchKeyDown}
      onSelectValue={state.selectValue}
      onRemoveValue={state.removeValue}
      onSetActiveIndex={state.setActiveIndex}
      onSearchChange={state.handleSearchChange}
      onMenuScrollNearEnd={state.onMenuScrollNearEnd}
      menuLoading={state.menuLoading}
    />
  )

  return (
    <SelectField
      selectId={state.selectId}
      labelId={state.labelId}
      label={label}
      labelClassName={labelClassName}
      required={required}
      grow={grow}
      wrapperClassName={wrapperClassName}
      adminLabel={state.useAdminLabel}
      selectElement={selectElement}
      feedback={
        <SelectFeedback
          feedbackId={state.feedbackId}
          errorMessage={state.errorMessage}
          helperText={helperText}
        />
      }
    />
  )
})

Select.displayName = 'Select'

type SelectComponent = {
  (props: SelectSingleProps & React.RefAttributes<HTMLSelectElement>): React.ReactElement | null
  (props: SelectMultiProps & React.RefAttributes<HTMLSelectElement>): React.ReactElement | null
}

export const SelectExport = Select as unknown as SelectComponent
export { SelectExport as Select }
