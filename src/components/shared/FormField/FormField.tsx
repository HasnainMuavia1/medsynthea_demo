import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

export const RequiredFieldMark = () => {
  return (
    <Fragment>
      <span className="ml-1 text-destructive" aria-hidden>
        *
      </span>
      <span className="sr-only">(required)</span>
    </Fragment>
  )
}

/**
 * Label + control stack for dialogs and dense forms.
 * Pair with `ui.layout.fieldGrid` / `fieldGrid3` / `dialogSplit` and `ui.form.controlCompact`.
 */
export const FormField = ({
  id,
  label,
  required,
  children,
  className,
  hint,
  error,
  labelClassName,
}: FormFieldProps) => {
  const errorId = `${id}-error`
  return (
    <div className={cn(ui.layout.fieldStack, className)}>
      <label htmlFor={id} className={cn(ui.typography.label, labelClassName)}>
        {label}
        {required ? <RequiredFieldMark /> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="text-2xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-2xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export type FormFieldProps = {
  id: string
  label: string
  required?: boolean
  children: ReactNode
  className?: string
  hint?: ReactNode
  error?: string
  labelClassName?: string
}
