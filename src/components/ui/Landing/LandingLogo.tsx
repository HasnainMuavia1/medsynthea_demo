'use client'

import Image from 'next/image'
import Link from 'next/link'

import brandLogo from '@/assets/brand-logo.webp'
import brandLogoDark from '@/assets/logo_whitebg.webp'
import { useTheme } from '@/components/shared/ThemeProvider/ThemeProvider'
import { cn } from '@/utils'

export const LANDING_LOGO_SRC = brandLogo
export const LANDING_LOGO_SRC_DARK = brandLogoDark

export const LANDING_LOGO_SIZES = {
  nav: {
    width: 150,
    height: 42,
    className: 'h-auto w-logo-nav shrink-0 object-contain object-left',
    sizes: '(max-width: 640px) 128px, 150px',
  },
  footer: {
    width: 192,
    height: 54,
    className: 'h-auto w-logo-footer shrink-0 object-contain object-left',
    sizes: '(max-width: 640px) 168px, 192px',
  },
  auth: {
    width: 150,
    height: 42,
    className: 'h-auto w-logo-nav shrink-0 object-contain object-left',
    sizes: '150px',
  },
  compact: {
    width: 120,
    height: 34,
    className: 'h-auto w-logo-compact shrink-0 object-contain object-left',
    sizes: '120px',
  },
} as const

type LandingLogoProps = {
  size?: LandingLogoSize
  className?: string
  priority?: boolean
  onDark?: boolean
}

export const LandingLogo = ({
  size = 'nav',
  className,
  priority,
  onDark = false,
}: LandingLogoProps) => {
  const { theme } = useTheme()
  const config = LANDING_LOGO_SIZES[size]
  const src = onDark || theme === 'dark' ? LANDING_LOGO_SRC_DARK : LANDING_LOGO_SRC

  return (
    <Image
      src={src}
      alt="MedSynthea"
      width={config.width}
      height={config.height}
      sizes={config.sizes}
      className={cn(config.className, className)}
      style={{ height: 'auto' }}
      priority={priority ?? size === 'nav'}
    />
  )
}

type LandingLogoLockupProps = {
  size?: LandingLogoSize
  className?: string
  priority?: boolean
  href?: string
  onDark?: boolean
}

export const LandingLogoLockup = ({
  size,
  className,
  priority,
  href,
  onDark,
}: LandingLogoLockupProps) => {
  const lockupClassName = cn('inline-flex items-center', className)

  if (!href) {
    return (
      <span className={lockupClassName}>
        <LandingLogo size={size} priority={priority} onDark={onDark} />
      </span>
    )
  }

  return (
    <Link href={href} className={lockupClassName}>
      <LandingLogo size={size} priority={priority} onDark={onDark} />
    </Link>
  )
}

export type LandingLogoSize = keyof typeof LANDING_LOGO_SIZES
