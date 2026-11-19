import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils'
import { ui } from '@/styles/ui'

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', hasError, error, id, leftIcon: LeftIcon, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const isError = hasError || Boolean(error)
    const input = (
      <input
        type={type}
        id={inputId}
        className={cn(
          ui.form.input,
          isError && 'border-destructive/50 focus:border-destructive/50 focus:ring-destructive/30',
          className,
          LeftIcon && 'pl-9'
        )}
        ref={ref}
        aria-invalid={isError || undefined}
        {...props}
      />
    )

    if (!LeftIcon) {
      return input
    }

    return (
      <div className="relative w-full">
        <LeftIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 shrink-0 text-muted-foreground"
          aria-hidden
        />
        {input}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  error?: string | boolean | null
  helperText?: string
  leftIcon?: LucideIcon
}
