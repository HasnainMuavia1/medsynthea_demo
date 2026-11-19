import { forwardRef, useId } from 'react'
import { Checkbox, type CheckboxProps } from './Checkbox'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

export interface FormCheckboxProps extends Omit<CheckboxProps, 'type'> {
  label: string
  error?: string | boolean
  helperText?: string
  idPrefix?: string
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helperText, required, id, className, idPrefix, name, ...props }, ref) => {
    const defaultId = useId()
    const inputId = id ?? (idPrefix && name ? `${idPrefix}-${name}` : defaultId)
    const errorId = `error-${inputId}`
    const helperId = `helper-${inputId}`

    const isError = Boolean(error)
    const errorMessage = typeof error === 'string' ? error : undefined
    const describedBy = isError ? errorId : helperText ? helperId : undefined

    return (
      <div className={cn(ui.layout.fieldStack, className)}>
        <div className="flex items-start gap-2">
          <Checkbox
            id={inputId}
            name={name}
            ref={ref}
            required={required}
            aria-required={required || undefined}
            aria-invalid={isError || undefined}
            aria-describedby={describedBy}
            {...props}
            className="mt-0.5"
          />
          <label
            htmlFor={inputId}
            className={cn(ui.typography.label, 'cursor-pointer leading-snug')}
          >
            {label}
            {required && (
              <span aria-hidden="true" className="ml-1 text-destructive">
                *
              </span>
            )}
            {required && <span className="sr-only">(required)</span>}
          </label>
        </div>
        {errorMessage ? (
          <p id={errorId} className="text-2xs font-medium text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-2xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
FormCheckbox.displayName = 'FormCheckbox'
