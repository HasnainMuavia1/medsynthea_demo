import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'
import { ui } from '@/styles/ui'

export const SelectFeedback = ({ feedbackId, errorMessage, helperText }: SelectFeedbackProps) => {
  if (!errorMessage && !helperText) return null

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      id={feedbackId}
      role={errorMessage ? 'alert' : undefined}
      className="px-0.5 pt-0.5"
    >
      {errorMessage ? (
        <span className="text-2xs font-medium text-destructive leading-snug">{errorMessage}</span>
      ) : (
        <span className="text-2xs text-muted-foreground leading-snug">{helperText}</span>
      )}
    </motion.div>
  )
}

const RequiredMarkers = ({ required }: { required?: boolean }) => {
  if (!required) return null
  return (
    <Fragment>
      <span className="ml-1 text-destructive" aria-hidden="true">
        *
      </span>
      <span className="sr-only">(required)</span>
    </Fragment>
  )
}

export const SelectField = ({
  selectId,
  labelId,
  label,
  labelClassName,
  required,
  grow,
  wrapperClassName,
  adminLabel,
  selectElement,
  feedback,
}: SelectFieldProps) => {
  const hasLabel = Boolean(label)

  return (
    <div
      role={adminLabel && hasLabel ? 'group' : undefined}
      aria-labelledby={adminLabel && hasLabel ? labelId : undefined}
      className={cn(
        ui.layout.fieldStack,
        'w-full min-w-0 max-w-full',
        grow && 'flex-1',
        wrapperClassName
      )}
    >
      {hasLabel ? (
        <label htmlFor={selectId} id={labelId} className={cn(ui.typography.label, labelClassName)}>
          {label}
          <RequiredMarkers required={required} />
        </label>
      ) : null}
      {selectElement}
      {feedback}
    </div>
  )
}

export interface SelectFeedbackProps {
  feedbackId?: string
  errorMessage?: string
  helperText?: string
}

export interface SelectFieldProps {
  selectId: string
  labelId: string
  label?: string
  labelClassName?: string
  required?: boolean
  grow?: boolean
  wrapperClassName?: string
  adminLabel?: boolean
  selectElement: React.ReactNode
  feedback: React.ReactNode
}
