import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils'

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
} as const

const variantClasses = {
  default: 'border-border/80 bg-card shadow-sm',
  muted: 'border-border/70 bg-muted/15',
  ghost: 'border-border/30 bg-card/20 backdrop-blur-sm',
} as const

export const Card = ({
  children,
  className,
  padding = 'md',
  variant = 'default',
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 md:px-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardTitle = ({ children, className, ...props }: CardTitleProps) => {
  return (
    <h2 className={cn('text-section-title text-foreground', className)} {...props}>
      {children}
    </h2>
  )
}

export const CardDescription = ({ children, className, ...props }: CardDescriptionProps) => {
  return (
    <p className={cn('max-w-3xl text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
}

export const CardContent = ({ children, className, ...props }: CardContentProps) => {
  return (
    <div className={cn('p-5 md:p-6', className)} {...props}>
      {children}
    </div>
  )
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'muted' | 'ghost'
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}
