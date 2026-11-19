import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes } from 'react'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-medium transition-[background,border-color,box-shadow,transform,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-busy:opacity-100 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'border-border bg-card text-foreground hover:bg-secondary hover:border-foreground/25 hover:shadow-sm',
        primary:
          'border-primary bg-primary text-primary-foreground hover:bg-primary-hover hover:border-primary-hover hover:text-primary-foreground',
        inverse:
          'border-foreground bg-foreground text-background hover:bg-foreground/90 hover:border-foreground/90',
        outline:
          'border-border bg-transparent text-foreground hover:bg-secondary hover:border-foreground/25 hover:shadow-sm',
        outlinePrimary:
          'border-primary bg-background/80 text-primary shadow-card-sm hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-card-md',
        secondary:
          'border-border bg-secondary text-foreground hover:bg-background hover:border-foreground/25 hover:shadow-sm',
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border/60',
        destructive:
          'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive-hover hover:border-destructive-hover',
        link: 'h-auto border-transparent bg-transparent p-0 text-primary underline-offset-4 hover:underline',
        unstyled:
          'border-transparent bg-transparent shadow-none hover:shadow-none active:translate-y-0',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-3.5 text-base',
        lg: 'h-11 px-4.5 text-sm',
        default: 'h-9 px-3.5 text-base',
        icon: 'size-9 p-0',
        auto: 'h-auto min-h-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  href?: string
  fallbackHref?: string
  target?: HTMLAnchorElement['target']
  rel?: string
}
