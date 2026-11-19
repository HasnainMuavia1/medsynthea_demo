import type { ReactNode } from 'react'
import Image from 'next/image'
import authBackground from '@/assets/images/login-page-background.webp'
import { Loader } from '@/components/shared/Loader/Loader'
import { landingShell, LandingLogoLockup } from '@/components/ui/Landing/landing-ui'
import { AuthHeroPane } from './AuthHeroPane'
import { AuthHipaaBadge } from './AuthHipaaBadge'

export const AuthLayout = ({

  eyebrow,
  title,
  description,
  footer,
  pending,
  children,
}: AuthLayoutProps) => {
  return (
    <div className={landingShell} data-auth-fluid>
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/14 via-background to-background desktop:hidden" />

        <div className="pointer-events-none absolute inset-0 hidden desktop:block">
          <Image src={authBackground} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-panel/70 via-brand-panel/25 to-transparent" />
        </div>

        <div className="relative z-1 grid min-h-screen w-full grid-cols-1 desktop:grid-cols-2">
          <AuthHeroPane />
          <main
            id="main-content"
            className="relative flex min-h-screen flex-col px-4 py-6 sm:px-6 sm:py-7 md:px-8 desktop:px-10 short:py-3"
          >
            <AuthHipaaBadge />
            <div className="relative flex flex-1 items-center justify-center pt-6 pb-6 desktop:items-center desktop:justify-end short:py-2">
              <section
                aria-busy={pending ? true : undefined}
                className="relative flex w-full max-w-auth-card flex-col gap-4.5 rounded-2xl border border-border bg-card p-6 shadow-card-md short:gap-3 short:p-5"
              >
                {pending ? (
                  <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm">
                    <Loader
                      variant="centered"
                      size="md"
                      label={pending.label}
                      description={pending.description}
                    />
                  </div>
                ) : null}

                <LandingLogoLockup href="/" size="auth" className="mx-auto desktop:hidden" />

                <header className="w-full">
                  {eyebrow ? <p className="text-xs font-medium text-primary">{eyebrow}</p> : null}
                  <h1 className="mt-1 text-auth-title font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                  {description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  ) : null}
                </header>

                {children}

                {footer ? (
                  <div className="text-center text-sm text-muted-foreground">{footer}</div>
                ) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export interface AuthLayoutSeo {
  title: string
  description: string
  path: string
}

export interface AuthLayoutPending {
  label: string
  description: string
}

export interface AuthLayoutProps {
  seo: AuthLayoutSeo
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  footer?: ReactNode
  /** Blocks the card with a loader while an auth request is in flight. */
  pending?: AuthLayoutPending | null
  children: ReactNode
}
