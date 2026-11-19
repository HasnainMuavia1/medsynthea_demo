import { LandingLogoLockup } from '@/components/ui/Landing/landing-ui'
import { AuthHeroFeatureList } from './AuthHeroFeatureList'
import { AuthHeroStatsRow } from './AuthHeroStatsRow'
import { AUTH_HERO_LEAD } from './authHeroData'

export const AuthHeroPane = () => {
  return (
    <aside className="relative hidden flex-col gap-8 px-11 py-9 text-brand-panel-foreground desktop:flex short:gap-5 short:py-6">
      <LandingLogoLockup href="/" size="auth" onDark className="shrink-0" />

      <div className="mt-auto flex max-w-auth-hero flex-col gap-6 short:gap-4">
        <div>
          <p className="text-auth-hero font-bold leading-display tracking-tight [text-shadow:0_3px_10px_color-mix(in_srgb,var(--brand-panel)_75%,transparent)]">
            Simpler operations for a{' '}
            <em className="not-italic text-brand-panel-accent">healthier</em> tomorrow.
          </p>
          <p className="mt-3.5 text-auth-lead leading-normal text-brand-panel-foreground/85">
            {AUTH_HERO_LEAD}
          </p>
        </div>
        <AuthHeroFeatureList />
      </div>

      <div className="mt-6 mb-auto w-full">
        <AuthHeroStatsRow />
      </div>
    </aside>
  )
}
