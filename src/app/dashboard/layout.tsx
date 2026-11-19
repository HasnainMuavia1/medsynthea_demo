'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DEMO_NAV, isNavActive } from '@/components/demo/navigation'
import { Loader } from '@/components/shared/Loader/Loader'
import { DemoSidebar } from '@/components/demo/DemoSidebar'
import { DemoHeader } from '@/components/demo/DemoHeader'
import { DemoToaster } from '@/components/demo/DemoToaster'
import { useClaimStatusSimulator } from '@/components/demo/useClaimStatusSimulator'
import { useHydrated } from '@/components/demo/useHydrated'
import { useDemoStore } from '@/demo/store'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils'

const SHELL_BASE = 'min-h-screen min-w-app-min bg-background text-foreground text-base leading-snug antialiased'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const hydrated = useHydrated()
  const authed = useDemoStore((s) => s.authed)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const pathname = usePathname()
  useClaimStatusSimulator()

  const navMatch = [...DEMO_NAV.flatMap((g) => g.items)].reverse().find((i) => isNavActive(i.href, pathname))
  const pageLabel = pathname.startsWith('/dashboard/cases/')
    ? 'Encounter'
    : pathname.endsWith('/patients/new')
      ? 'Register patient'
      : pathname.endsWith('/appointments/new')
        ? 'Schedule appointment'
        : (navMatch?.label ?? 'Dashboard')

  useEffect(() => {
    if (hydrated && !authed) router.replace('/login')
  }, [hydrated, authed, router])

  if (!hydrated || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader variant="centered" size="md" label="Loading workspace" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        SHELL_BASE,
        'grid',
        collapsed
          ? 'grid-cols-[var(--spacing-app-sidebar-collapsed)_minmax(0,1fr)]'
          : 'grid-cols-[var(--spacing-app-sidebar)_minmax(0,1fr)]'
      )}
    >
      <title>{`${pageLabel} | MedSynthea Demo`}</title>
      <DemoSidebar />
      <div className="flex h-screen min-w-0 flex-col overflow-hidden">
        <DemoHeader />
        <main id="main-content" className="relative min-w-0 flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar" tabIndex={-1}>
          {children}
        </main>
      </div>
      <DemoToaster />
    </div>
  )
}

export default DashboardLayout
