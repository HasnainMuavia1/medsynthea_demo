import type { ReactNode } from 'react'
import { cn } from '@/utils'
import { marketingType } from './marketing-type'

export {
  LANDING_LOGO_SIZES,
  LANDING_LOGO_SRC,
  LANDING_LOGO_SRC_DARK,
  LandingLogo,
  LandingLogoLockup,
  type LandingLogoSize,
} from './LandingLogo'

export { marketingType } from './marketing-type'

export const landingShell =
  'min-h-screen overflow-x-clip bg-background text-foreground text-sm leading-normal antialiased [&_svg]:block [&_button]:cursor-pointer [&_a]:no-underline [&_h1,&_h2,&_h3,&_h4]:m-0 [&_h1,&_h2,&_h3,&_h4]:font-semibold [&_h1,&_h2,&_h3,&_h4]:tracking-tight [&_h1,&_h2,&_h3,&_h4]:leading-tight'

export const landingContainer = 'mx-auto w-full max-w-page px-4 sm:px-6 desktop:px-8'

export const landingSectionY = 'py-10 md:py-14'

export const landingAgentCardClass = cn(
  'rounded-xl border-border bg-card p-4.5 shadow-none',
  'transition-[border-color,box-shadow] duration-120',
  'hover:border-foreground/20 hover:shadow-card-sm'
)

export const LandingEyebrow = ({
  children,
  dotClassName,
  className,
}: {
  children: ReactNode
  dotClassName?: string
  className?: string
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground',
        className
      )}
    >
      <span
        className={cn(
          'relative size-1.5 shrink-0 rounded-full bg-primary before:absolute before:-inset-0.5 before:animate-landing-pulse before:rounded-full before:bg-primary before:opacity-25 before:content-[""]',
          dotClassName
        )}
      />
      {children}
    </span>
  )
}

export const LandingSectionHeader = ({
  eyebrow,
  title,
  description,
  dotClassName,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  dotClassName?: string
}) => {
  return (
    <div className="mx-auto mb-13 max-w-copy text-center">
      {eyebrow ? (
        <LandingEyebrow className="mx-auto mb-4" dotClassName={dotClassName}>
          {eyebrow}
        </LandingEyebrow>
      ) : null}
      <h2 className={marketingType.sectionTitle}>{title}</h2>
      {description ? (
        <p className={cn(marketingType.sectionDescriptionCenter)}>{description}</p>
      ) : null}
    </div>
  )
}

export const LandingBadge = ({
  children,
  dotColor,
  className,
}: {
  children: ReactNode
  dotColor?: string
  className?: string
}) => {
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center gap-1 rounded-full border border-border bg-secondary px-2 text-xs font-medium leading-none text-muted-foreground whitespace-nowrap',
        className
      )}
    >
      <span
        className="size-1.25 shrink-0 rounded-full bg-current"
        style={dotColor ? { background: dotColor } : undefined}
      />
      {children}
    </span>
  )
}

export const LogoWordmarkGlyph = ({ type }: { type: 'glyph' | 'glyph-circle' | 'glyph-plus' }) => {
  if (type === 'glyph-circle') {
    return <span className="size-3.5 shrink-0 rounded-full bg-current opacity-35" aria-hidden />
  }
  if (type === 'glyph-plus') {
    return (
      <span
        className="relative size-4 shrink-0 opacity-40 before:absolute before:left-1/2 before:top-0 before:h-4 before:w-0.5 before:-translate-x-1/2 before:rounded-sm before:bg-current after:absolute after:left-0 after:top-1/2 after:h-0.5 after:w-4 after:-translate-y-1/2 after:rounded-sm after:bg-current"
        aria-hidden
      />
    )
  }
  return <span className="size-4.25 shrink-0 rounded bg-current opacity-35" aria-hidden />
}
