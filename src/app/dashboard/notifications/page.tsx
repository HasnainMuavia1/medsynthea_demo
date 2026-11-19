'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  BellOff,
  Check,
  CheckCheck,
  ClipboardCheck,
  FileCheck2,
  FileLock2,
  FileText,
  Mail,
  MailOpen,
  PhoneCall,
  Receipt,
  Send,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { RcmPage } from '@/components/ui/Rcm/RcmLayout'
import { Button } from '@/components/shared/Button'
import { SearchField } from '@/components/shared/SearchField'
import { formatRelative } from '@/demo/engine'
import { useDemoStore } from '@/demo/store'
import type { DemoNotification, NotificationKind } from '@/demo/types'
import { cn } from '@/utils'

type Filter = 'all' | 'unread' | 'eligibility' | 'claims' | 'denials' | 'remittance' | 'payments'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'eligibility', label: 'Eligibility & PA' },
  { id: 'claims', label: 'Claims' },
  { id: 'denials', label: 'Denials & AR' },
  { id: 'remittance', label: 'ERA / EOB' },
  { id: 'payments', label: 'Payments' },
]

const KIND_META: Record<NotificationKind, { icon: LucideIcon; category: string; filter: Filter }> = {
  patient: { icon: UserPlus, category: 'Front office', filter: 'all' },
  eligibility: { icon: ShieldCheck, category: 'Eligibility', filter: 'eligibility' },
  priorauth: { icon: FileLock2, category: 'Prior auth', filter: 'eligibility' },
  note: { icon: FileText, category: 'Documentation', filter: 'claims' },
  coding: { icon: ClipboardCheck, category: 'Coding', filter: 'claims' },
  claim: { icon: Send, category: 'Claims', filter: 'claims' },
  status: { icon: Activity, category: 'Claim status', filter: 'claims' },
  denial: { icon: TriangleAlert, category: 'Denial', filter: 'denials' },
  ar: { icon: PhoneCall, category: 'AR caller', filter: 'denials' },
  era: { icon: Receipt, category: 'Remittance', filter: 'remittance' },
  eob: { icon: FileCheck2, category: 'EOB', filter: 'remittance' },
  payment: { icon: Wallet, category: 'Payments', filter: 'payments' },
}

const PILL = 'inline-flex items-center rounded-full border border-pill-gray-border bg-pill-gray-bg px-1.5 py-0.5 text-3xs font-medium text-pill-gray-text'

const NotificationItem = ({ n, onOpen }: { n: DemoNotification; onOpen: () => void }) => {
  const toggleRead = useDemoStore((s) => s.toggleRead)
  const remove = useDemoStore((s) => s.removeNotification)
  const meta = KIND_META[n.kind]
  const Icon = meta.icon
  const isUnread = !n.read
  return (
    <article
      className="group relative rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:bg-muted/30 hover:border-border"
      aria-label={`${n.title}. ${isUnread ? 'Unread' : 'Read'}`}
    >
      <div className="flex gap-3 px-3.5 py-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-pill-green-bg border border-pill-green-border" aria-hidden>
          <Icon className="size-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Button type="button" variant="unstyled" size="auto" onClick={onOpen} className="min-w-0 flex items-center gap-2 flex-wrap text-left whitespace-normal">
              <h3 className={cn('text-sm leading-snug text-foreground truncate max-w-full', isUnread ? 'font-semibold' : 'font-medium')}>{n.title}</h3>
              {isUnread && (
                <span className="inline-flex items-center gap-1 rounded-full border border-pill-gray-border bg-pill-gray-bg px-1.5 py-0.5 text-3xs font-medium text-pill-gray-text shrink-0">
                  <Mail className="size-3" aria-hidden />
                  Unread
                </span>
              )}
            </Button>
            <div className="flex items-center gap-0.5 shrink-0">
              <time dateTime={n.at} className="text-2xs tabular-nums text-muted-foreground whitespace-nowrap pr-1">
                {formatRelative(n.at)}
              </time>
              <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" onClick={() => toggleRead(n.id)} aria-label={isUnread ? 'Mark as read' : 'Mark as unread'}>
                {isUnread ? <Check className="size-3.5" aria-hidden /> : <MailOpen className="size-3.5" aria-hidden />}
              </Button>
              <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" onClick={() => remove(n.id)} aria-label="Delete notification">
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{n.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={PILL}>{isUnread ? 'New' : 'Seen'}</span>
            <span className={PILL}>{meta.category}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

const NotificationsPage = () => {
  const router = useRouter()
  const notifications = useDemoStore((s) => s.notifications)
  const markRead = useDemoStore((s) => s.markRead)
  const markAllRead = useDemoStore((s) => s.markAllRead)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const unread = notifications.filter((n) => !n.read).length

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return notifications.filter((n) => {
      if (filter === 'unread' && n.read) return false
      if (filter !== 'all' && filter !== 'unread' && KIND_META[n.kind].filter !== filter) return false
      return !q || `${n.title} ${n.message}`.toLowerCase().includes(q)
    })
  }, [notifications, search, filter])

  return (
    <RcmPage className="min-w-0">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 pb-10">
        <div className="flex flex-row items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Notification Center</h2>
            <p className="text-sm text-muted-foreground mt-1">Billing lifecycle alerts from claims, eligibility, prior auth, remittance, AR calls and payments.</p>
          </div>
          <Button variant="outline" onClick={markAllRead} disabled={unread === 0} className="h-9 px-4 text-sm font-medium gap-2 disabled:opacity-50 shrink-0" aria-label="Mark all notifications as read">
            <CheckCheck className="size-3.5" aria-hidden />
            Mark all read
          </Button>
        </div>
        <div className="space-y-5">
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search notifications" aria-label="Search notifications" />
          <div className="-mx-1 px-1 overflow-x-auto" role="tablist" aria-label="Filter notifications">
            <div className="flex items-center gap-1.5 min-w-max pb-1">
              {FILTERS.map(({ id, label }) => {
                const isActive = filter === id
                return (
                  <Button
                    key={id}
                    type="button"
                    variant="unstyled"
                    size="auto"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setFilter(id)}
                    className={cn(
                      'relative h-8 rounded-lg px-3 text-xs',
                      isActive ? 'text-foreground font-semibold bg-background shadow-sm border border-border/50' : 'border border-transparent text-muted-foreground font-medium hover:text-foreground hover:bg-muted/30'
                    )}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
              <BellOff className="size-5 text-muted-foreground" aria-hidden />
              <div className="text-sm font-medium text-foreground">No notifications</div>
              <div className="text-xs text-muted-foreground">{search || filter !== 'all' ? 'Try a different search or filter.' : 'Agent events will show up here.'}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {visible.map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  onOpen={() => {
                    markRead(n.id)
                    if (n.caseId) router.push(`/dashboard/cases/${n.caseId}${n.step ? `?step=${n.step}` : ''}`)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RcmPage>
  )
}

export default NotificationsPage
