'use client'

import { Fragment, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, PanelLeftClose, PanelLeftOpen, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { LandingLogoLockup } from '@/components/ui/Landing/LandingLogo'
import { useUIStore } from '@/store/uiStore'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useDemoStore } from '@/demo/store'
import { cn } from '@/utils'
import { DEMO_NAV, isNavActive, workQueueCount } from './navigation'

const linkClass = (active: boolean, collapsed: boolean) =>
  cn(
    'rounded-md transition-colors',
    collapsed
      ? 'mx-auto flex size-8 items-center justify-center'
      : 'flex h-auto w-full items-center gap-2 px-2.5 py-1.5 text-left text-fluid-nav font-medium capitalize whitespace-normal',
    active
      ? 'bg-card text-foreground shadow-sm [&_svg]:text-primary'
      : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
  )

export const DemoSidebar = () => {
  const pathname = usePathname()
  const isDesktop = useIsDesktop()
  const collapsed = useUIStore((s) => s.sidebarCollapsed) && isDesktop
  const toggle = useUIStore((s) => s.toggleSidebarCollapsed)
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const cases = useDemoStore((s) => s.cases)
  const [closed, setClosed] = useState<Record<string, boolean>>({})

  return (
    <aside
      id="app-sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-dvh w-64 max-w-[85vw] shrink-0 flex-col border-r border-border bg-secondary py-3 transition-transform duration-200',
        'lg:sticky lg:top-0 lg:z-auto lg:w-full lg:max-w-none lg:translate-x-0 lg:transition-none',
        mobileNavOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
        collapsed ? 'px-1.5' : 'px-3'
      )}
      inert={!isDesktop && !mobileNavOpen ? true : undefined}
    >
      <div
        className={cn(
          'flex h-10 items-center gap-1 pb-3.5',
          collapsed ? 'justify-center px-0' : 'justify-between px-2'
        )}
      >
        {collapsed ? null : (
          <LandingLogoLockup className="min-w-0 shrink leading-none" size="compact" href="/dashboard" priority />
        )}
        <Button
          type="button"
          variant="unstyled"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={isDesktop ? toggle : () => setMobileNavOpen(false)}
          aria-label={!isDesktop ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!isDesktop ? <X className="size-4" aria-hidden /> : collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
        </Button>
      </div>

      <nav
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-y-auto',
          collapsed ? 'items-center gap-1 no-scrollbar' : 'gap-px custom-scrollbar'
        )}
        aria-label="App"
      >
        {DEMO_NAV.map((group) => (
          <div key={group.section} className={cn(collapsed && 'flex w-full flex-col items-center gap-1')}>
            {collapsed ? null : group.section === 'My Workspace' ? (
              <div className="px-2.5 pb-1.5 pt-2.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.section}
              </div>
            ) : (
              <Button
                type="button"
                variant="unstyled"
                size="auto"
                className="flex h-auto w-full items-center gap-2 rounded-md px-2.5 pb-1.5 pt-2.5 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-normal hover:text-foreground"
                aria-expanded={!closed[group.section]}
                onClick={() => setClosed((c) => ({ ...c, [group.section]: !c[group.section] }))}
              >
                <span className="min-w-0 flex-1 truncate">{group.section}</span>
                <ChevronDown className={cn('size-3.5 shrink-0 transition-transform duration-150', closed[group.section] && '-rotate-90')} aria-hidden />
              </Button>
            )}
            {!collapsed && closed[group.section] ? null : (
            <div className={cn('flex flex-col', collapsed ? 'w-full items-center gap-1' : 'gap-px')}>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isNavActive(item.href, pathname)
                return (
                  <Button
                    key={item.id}
                    href={item.href}
                    variant="unstyled"
                    size={collapsed ? 'icon' : 'auto'}
                    className={linkClass(active, collapsed)}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="size-3.75 shrink-0" aria-hidden />
                    {collapsed ? null : (
                      <Fragment>
                        <span className="min-w-0 flex-1 truncate leading-snug">{item.label}</span>
                        {workQueueCount(item.id, cases) > 0 ? (
                          <span className="font-mono text-2xs text-muted-foreground" title="Items waiting">
                            {workQueueCount(item.id, cases)}
                          </span>
                        ) : null}
                      </Fragment>
                    )}
                  </Button>
                )
              })}
            </div>
            )}
          </div>
        ))}
      </nav>

      <div className={cn('mt-2 border-t border-border pt-2.5', collapsed && 'flex justify-center')}>
        <Button
          type="button"
          variant="unstyled"
          size={collapsed ? 'icon' : 'auto'}
          className={linkClass(false, collapsed)}
          onClick={resetDemo}
          aria-label={collapsed ? 'Reset demo data' : undefined}
          title="Restore the original sample data"
        >
          <RotateCcw className="size-3.75 shrink-0" aria-hidden />
          {collapsed ? null : <span className="min-w-0 flex-1 leading-snug">Reset demo data</span>}
        </Button>
      </div>
    </aside>
  )
}
