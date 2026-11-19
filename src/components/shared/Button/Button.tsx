'use client'

import { forwardRef, type MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'
import { buttonVariants, type ButtonProps } from './variants'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      href,
      fallbackHref,
      target,
      rel,
      type = 'button',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const router = useRouter()
    const isDisabled = Boolean(disabled || isLoading)
    const classes = cn(buttonVariants({ variant, size }), className)
    const content = isLoading ? (
      <span className="inline-flex items-center justify-center gap-2">
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        {children}
      </span>
    ) : (
      children
    )

    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
      onClick?.(event)
      if (event.defaultPrevented || !fallbackHref) return
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back()
        return
      }
      router.push(fallbackHref)
    }

    if (href && !fallbackHref) {
      return (
        <Link
          href={href}
          className={classes}
          ref={ref as never}
          target={target}
          rel={rel}
          {...(props as object)}
        >
          {content}
        </Link>
      )
    }

    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={classes}
        ref={ref}
        type={asChild ? undefined : type}
        {...props}
        onClick={fallbackHref ? handleClick : onClick}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button }
