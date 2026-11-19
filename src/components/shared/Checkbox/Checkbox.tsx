import React, { forwardRef } from 'react'
import { cn } from '@/utils'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate, className, ...props }, ref) => {
    const defaultRef = React.useRef<HTMLInputElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || defaultRef

    React.useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate ?? false
      }
    }, [resolvedRef, indeterminate])

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        className={cn(
          'size-4 rounded-sm border-border text-primary bg-background shadow-sm transition-colors',
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        aria-checked={indeterminate ? 'mixed' : props.checked}
        {...props}
      />
    )
  }
)
Checkbox.displayName = 'Checkbox'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
}
