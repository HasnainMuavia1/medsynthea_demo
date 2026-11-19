import { forwardRef, type InputHTMLAttributes, type MouseEvent } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils'
import { ui } from '@/styles/ui'

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      className,
      onClear,
      inputSize = 'md',
      hasError,
      value,
      disabled,
      'aria-label': ariaLabel = 'Search',
      ...props
    },
    ref
  ) => {
    const canClear = Boolean(onClear) && !disabled
    const showClear = canClear && String(value ?? '').length > 0

    const handleClearMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
    }

    return (
      <div className={cn('relative w-full min-w-0', className)}>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={ref}
          type="search"
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={hasError || undefined}
          className={cn(
            inputSize === 'lg' ? ui.form.searchInputLg : ui.form.searchInput,
            canClear && 'pr-10',
            hasError &&
              'border-destructive/50 focus:border-destructive/50 focus:ring-destructive/30'
          )}
          {...props}
        />
        {showClear ? (
          <div className="absolute inset-y-0 right-2 flex items-center">
            <Button
              type="button"
              variant="unstyled"
              size="auto"
              aria-label="Clear search"
              disabled={disabled}
              onMouseDown={handleClearMouseDown}
              onClick={onClear}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 active:translate-y-0"
            >
              <X className="size-3.5 shrink-0" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
    )
  }
)
SearchField.displayName = 'SearchField'

export { SearchField }

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
  inputSize?: 'md' | 'lg'
  hasError?: boolean
}
