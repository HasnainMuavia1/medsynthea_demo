import { forwardRef, type TextareaHTMLAttributes, useId } from 'react'
import { cn } from '@/utils'
import { ui } from '@/styles/ui'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, error, helperText, id, ...props }, ref) => {
    void helperText
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const isError = hasError || Boolean(error)
    return (
      <textarea
        id={textareaId}
        className={cn(
          ui.form.textarea,
          isError && 'border-destructive/50 focus:border-destructive/50 focus:ring-destructive/30',
          className
        )}
        ref={ref}
        aria-invalid={isError || undefined}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  error?: string | boolean
  helperText?: string
}
