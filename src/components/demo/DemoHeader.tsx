'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Building2, Clock, LogOut, Mail, Moon, Sun, UserPlus } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { RcmAvatar } from '@/components/ui/Rcm/RcmPrimitives'
import { usePopoverDismiss } from '@/hooks/usePopoverDismiss'
import { DEMO_ACCOUNT, PRACTICE } from '@/demo/reference'
import { formatRelative } from '@/demo/engine'
import { useDemoStore } from '@/demo/store'
import { useTheme } from '@/components/shared/ThemeProvider/ThemeProvider'
import { cn } from '@/utils'
import { GlobalSearch } from './GlobalSearch'
import { caseHref } from './caseLinks'

const NotificationsMenu = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const notifications = useDemoStore((s) => s.notifications)
  const markRead = useDemoStore((s) => s.markRead)
  const markAllRead = useDemoStore((s) => s.markAllRead)
  const unread = notifications.filter((n) => !n.read).length
  const close = useCallback(() => setOpen(false), [])
  usePopoverDismiss(open, close, ref)

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative !size-8"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications (${unread} unread)`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-4xs font-bold text-destructive-foreground">
            {unread}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div role="menu" className="absolute right-0 top-menu-offset-y z-50 w-96 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <Button type="button" variant="link" size="sm" className="text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.slice(0, 8).map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                role="menuitem"
                onClick={() => {
                  markRead(item.id)
                  setOpen(false)
                  if (item.caseId) router.push(caseHref(item.caseId, item.step))
                }}
                className="h-auto w-full justify-start rounded-none border-x-0 border-t-0 border-b border-border px-3.5 py-3 text-left font-normal whitespace-normal text-foreground hover:bg-muted/30 active:translate-y-0 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className={cn('line-clamp-1 flex-1 text-sm leading-snug', item.read ? 'font-medium' : 'font-semibold')}>
                      {item.title}
                    </div>
                    {item.read ? null : (
                      <span className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 text-3xs font-medium text-primary">
                        <Mail className="size-3" aria-hidden />
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.message}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-2xs text-muted-foreground">
                    <Clock className="size-3 shrink-0" aria-hidden />
                    {formatRelative(item.at)}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          <div className="border-t border-border px-3.5 py-2.5">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const AccountMenu = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const logout = useDemoStore((s) => s.logout)
  const { theme, toggleTheme } = useTheme()
  const close = useCallback(() => setOpen(false), [])
  usePopoverDismiss(open, close, ref)

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        className="h-8 max-w-56 justify-start gap-2 px-1.5 text-sm text-foreground active:translate-y-0"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="truncate font-medium">{DEMO_ACCOUNT.name}</span>
        <RcmAvatar name={DEMO_ACCOUNT.name} className="size-7 text-3xs" />
      </Button>
      {open ? (
        <div role="menu" className="absolute right-0 top-menu-offset-y z-50 w-64 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-lg">
          <div className="flex items-center gap-2.5 px-2 py-2.5">
            <RcmAvatar name={DEMO_ACCOUNT.name} className="size-8 text-xs" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{DEMO_ACCOUNT.name}</div>
              <div className="truncate text-xs text-muted-foreground">{DEMO_ACCOUNT.email}</div>
              <div className="truncate text-2xs text-muted-foreground">{DEMO_ACCOUNT.role}</div>
            </div>
          </div>
          <div className="my-1 h-px bg-border" />
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            className="h-auto w-full justify-start gap-2 px-2 py-2 text-sm text-foreground active:translate-y-0"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            className="h-auto w-full justify-start gap-2 px-2 py-2 text-sm text-foreground active:translate-y-0"
            onClick={() => {
              setOpen(false)
              logout()
              router.replace('/login')
            }}
          >
            <LogOut className="size-4 text-muted-foreground" />
            Log out
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export const DemoHeader = () => (
  <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/85 backdrop-blur-sm">
    <div className="flex h-13 items-center gap-3 px-5">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="size-4 shrink-0" aria-hidden />
        <span className="truncate font-medium text-foreground">{PRACTICE.shortName}</span>
        <span className="rounded-md border border-pill-yellow-border bg-pill-yellow-bg px-1.5 py-0.5 text-3xs font-semibold uppercase tracking-wide text-warning">
          Demo data
        </span>
      </div>
      <div className="flex flex-1 justify-center">
        <GlobalSearch />
      </div>
      <Button href="/dashboard/patients/new" variant="primary" size="sm">
        <UserPlus className="size-3.5" aria-hidden />
        Register patient
      </Button>
      <div className="flex shrink-0 items-center gap-1.5">
        <NotificationsMenu />
        <AccountMenu />
      </div>
    </div>
  </header>
)
