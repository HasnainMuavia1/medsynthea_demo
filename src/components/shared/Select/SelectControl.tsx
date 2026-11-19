import type { ReactNode } from 'react'
import { Button } from '@/components/shared/Button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils'
import { SelectChips } from './SelectChips'
import { SelectDropdown } from './SelectDropdown'
import type { SelectOption, SelectVariant } from './select.types'
import { selectBase, variantClasses } from './select.utils'

export const SelectControl = ({
  containerRef,
  selectId,
  labelId,
  listboxId,
  label,
  leadingIcon,
  disabled,
  required,
  name,
  open,
  grow,
  variant,
  showChevron,
  isError,
  className,
  menuClassName,
  ariaInvalidProp,
  ariaDescribedByProp,
  feedbackId,
  selectedTitle,
  displayLabel,
  selectedOption,
  multiple,
  showSelectionChips = true,
  selectedOptions,
  placeholder,
  placeholderDisabled,
  stringValue,
  selectedValues,
  options,
  visibleOptions,
  selectableOptions,
  effectiveActiveIndex,
  showPlaceholderOption,
  searchable,
  searchId,
  searchQuery,
  searchPlaceholder,
  noResultsText,
  menuStyle,
  listboxRef,
  setRefs,
  onToggleOpen,
  onKeyDown,
  onSearchKeyDown,
  onSelectValue,
  onRemoveValue,
  onSetActiveIndex,
  onSearchChange,
  onMenuScrollNearEnd,
  menuLoading,
}: SelectControlProps) => {
  const triggerClass = cn(
    'shared-select',
    selectBase,
    variantClasses[variant],
    'overflow-hidden',
    showChevron && 'flex items-center justify-between gap-1.5 text-left',
    isError &&
      variant !== 'pill' &&
      'border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive',
    open && variant !== 'pill' && 'border-primary/50 ring-2 ring-primary/30',
    className
  )

  const multiValues = Array.from(selectedValues)
  const isShowingPlaceholder =
    Boolean(placeholder) &&
    ((multiple && selectedOptions.length === 0) || (!multiple && !selectedOption))
  const valueLabel = (
    <span
      className={cn(
        'block min-w-0 flex-1 truncate whitespace-nowrap text-left',
        isShowingPlaceholder && 'text-muted-foreground'
      )}
    >
      {displayLabel}
    </span>
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'group/shared-select relative w-full min-w-0 max-w-full isolate',
        grow && 'flex-1 min-w-0'
      )}
    >
      {multiple && showSelectionChips && selectedOptions.length > 0 ? (
        <div className="mb-1.5">
          <SelectChips options={selectedOptions} disabled={disabled} onRemove={onRemoveValue} />
        </div>
      ) : null}

      <Button
        type="button"
        variant="unstyled"
        size="auto"
        id={selectId}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        aria-invalid={ariaInvalidProp ?? (isError || undefined)}
        aria-required={required || undefined}
        aria-describedby={ariaDescribedByProp ?? (feedbackId ? feedbackId : undefined)}
        title={selectedTitle}
        className={cn(
          triggerClass,
          'font-normal',
          multiple && showSelectionChips && selectedOptions.length > 0 && 'h-auto min-h-9 py-1.5'
        )}
        onClick={(event) => {
          event.stopPropagation()
          if (!disabled) onToggleOpen()
        }}
        onKeyDown={onKeyDown}
      >
        {leadingIcon ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-muted-foreground" aria-hidden>
              {leadingIcon}
            </span>
            {valueLabel}
          </span>
        ) : (
          valueLabel
        )}
        {showChevron ? (
          <span className="inline-flex shrink-0 items-center gap-1.5">
            {multiple && selectedOptions.length > 0 ? (
              <span className="rounded-md bg-pill-green-bg px-1.5 py-0.5 text-3xs font-semibold uppercase tracking-wide text-primary">
                {selectedOptions.length}
              </span>
            ) : null}
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180 text-primary',
                'motion-reduce:transition-none motion-reduce:rotate-0'
              )}
              aria-hidden
            />
          </span>
        ) : null}
      </Button>

      <SelectDropdown
        open={open}
        listboxRef={listboxRef}
        listboxId={listboxId}
        label={label}
        labelId={labelId}
        selectId={selectId}
        menuStyle={menuStyle}
        menuClassName={menuClassName}
        showPlaceholderOption={showPlaceholderOption}
        placeholder={placeholder}
        placeholderDisabled={placeholderDisabled}
        multiple={multiple}
        stringValue={stringValue}
        selectedValues={selectedValues}
        options={visibleOptions}
        selectableOptions={selectableOptions}
        effectiveActiveIndex={effectiveActiveIndex}
        searchable={searchable}
        searchId={searchId}
        searchQuery={searchQuery}
        searchPlaceholder={searchPlaceholder}
        noResultsText={noResultsText}
        onSearchChange={onSearchChange}
        onSearchKeyDown={onSearchKeyDown}
        onSelectValue={onSelectValue}
        onSetActiveIndex={onSetActiveIndex}
        onMenuScrollNearEnd={onMenuScrollNearEnd}
        menuLoading={menuLoading}
      />

      <select
        ref={setRefs}
        name={name}
        value={multiple ? multiValues : stringValue}
        multiple={multiple || undefined}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={() => {}}
      >
        {!multiple && placeholder !== undefined ? (
          <option value="" disabled={placeholderDisabled}>
            {placeholder}
          </option>
        ) : null}
        {options
          .filter((opt) => multiple || placeholder === undefined || opt.value !== '')
          .map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
      </select>
    </div>
  )
}

export interface SelectControlProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  selectId: string
  labelId: string
  listboxId: string
  label?: string
  leadingIcon?: ReactNode
  disabled?: boolean
  required?: boolean
  name?: string
  open: boolean
  grow?: boolean
  variant: SelectVariant
  showChevron: boolean
  isError: boolean
  className?: string
  menuClassName?: string
  ariaInvalidProp?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  ariaDescribedByProp?: string
  feedbackId?: string
  selectedTitle?: string
  displayLabel: string
  selectedOption?: SelectOption
  multiple: boolean
  showSelectionChips?: boolean
  selectedOptions: SelectOption[]
  placeholder?: string
  placeholderDisabled: boolean
  stringValue: string
  selectedValues: Set<string>
  options: SelectOption[]
  visibleOptions: SelectOption[]
  selectableOptions: SelectOption[]
  effectiveActiveIndex: number
  showPlaceholderOption: boolean
  searchable: boolean
  searchId: string
  searchQuery: string
  searchPlaceholder: string
  noResultsText: string
  menuStyle: React.CSSProperties
  listboxRef: React.RefObject<HTMLUListElement | null>
  setRefs: (node: HTMLSelectElement | null) => void
  onToggleOpen: () => void
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>
  onSearchKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  onSelectValue: (nextValue: string) => void
  onRemoveValue: (nextValue: string) => void
  onSetActiveIndex: (index: number) => void
  onSearchChange: (value: string) => void
  onMenuScrollNearEnd?: () => void
  menuLoading?: boolean
}
