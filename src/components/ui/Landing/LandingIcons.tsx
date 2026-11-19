import type { SVGProps } from 'react'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const LogoGlyph = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M5 12h3l2-5 4 10 2-5h3" />
    </svg>
  )
}

const thin = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const MailIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...thin} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export const LockIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...thin} {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  )
}

export const KeyIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...thin} {...props}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m10.5 12.5 8-8M16 6l3 3M14 8l3 3" />
    </svg>
  )
}

export const EyeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" {...thin} {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" {...thin} {...props}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  )
}

export const BoltIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5z" />
    </svg>
  )
}

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export const ArrowRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  )
}

export const PlayOutline = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="m6 4 14 8-14 8z" />
    </svg>
  )
}

export const PlaySolid = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 4l14 8-14 8z" />
    </svg>
  )
}

export const Check = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      {...props}
    >
      <path d="m4 12 5 5L20 6" />
    </svg>
  )
}

const capStroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const IcoEligibility = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...capStroke} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export const IcoTranscription = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...capStroke} {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

export const IcoCoding = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...capStroke} {...props}>
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  )
}

export const IcoScrub = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...capStroke} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export const IcoDenial = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...capStroke} {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-6" />
    </svg>
  )
}

export const IcoReconcile = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...capStroke} {...props}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v5h-5" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export const SecurityShieldLockMark = ({ className, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="32" cy="32" r="30" className="fill-primary/20" />
      <path
        d="M32 12.5c6.2 0 11.2 1.4 14.8 3.2.9.4 1.5 1.3 1.5 2.3v14.2c0 9.4-6.2 17.2-16.3 21.1-.5.2-1 .2-1.5 0C20.4 49.4 14.2 41.6 14.2 32.2V17.9c0-1 .6-1.9 1.5-2.3C19.3 13.9 24.8 12.5 32 12.5Z"
        className="fill-primary"
      />
      <path
        d="M32 22.2c-2.6 0-4.7 2.1-4.7 4.7v2.4h-1.6c-.9 0-1.6.7-1.6 1.6v7.4c0 .9.7 1.6 1.6 1.6h12.6c.9 0 1.6-.7 1.6-1.6v-7.4c0-.9-.7-1.6-1.6-1.6h-1.6v-2.4c0-2.6-2.1-4.7-4.7-4.7Zm-2.8 4.7c0-1.5 1.3-2.8 2.8-2.8s2.8 1.3 2.8 2.8v2.4h-5.6v-2.4Z"
        className="fill-card"
      />
      <path
        d="M32 34.2c-.7 0-1.2.4-1.4 1l-.5 1.6c-.1.4.1.8.4 1.1.3.2.6.3 1 .2h1c.4.1.7 0 1-.2.3-.3.5-.7.4-1.1l-.5-1.6c-.2-.6-.7-1-1.4-1Z"
        className="fill-primary"
      />
    </svg>
  )
}
