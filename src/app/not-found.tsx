import { Compass } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { LandingLogoLockup } from '@/components/ui/Landing/LandingLogo'

const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
    <title>Page not found | MedSynthea</title>
    <LandingLogoLockup size="auth" href="/dashboard" />
    <div className="mt-4 flex size-12 items-center justify-center rounded-full bg-pill-green-bg text-primary">
      <Compass className="size-6" aria-hidden />
    </div>
    <h1 className="text-hero font-bold text-foreground">Page not found</h1>
    <p className="max-w-md text-sm text-muted-foreground">This page doesn&apos;t exist. Head back to the workspace to continue the revenue-cycle journey.</p>
    <Button href="/dashboard" variant="primary" size="sm">
      Back to dashboard
    </Button>
  </main>
)

export default NotFound
