'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BellRing, X } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { useDemoStore } from '@/demo/store'
import { caseHref } from './caseLinks'

const TOAST_MS = 4500

const ToastCard = ({ id }: { id: string }) => {
  const router = useRouter()
  const toast = useDemoStore((s) => s.toasts.find((t) => t.id === id) ?? null)
  const dismiss = useDemoStore((s) => s.dismissToast)
  const markRead = useDemoStore((s) => s.markRead)

  useEffect(() => {
    const t = window.setTimeout(() => dismiss(id), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [id, dismiss])

  if (!toast) return null
  const { title, message, caseId, step } = toast

  return (
    <div role="status" className="pointer-events-auto flex w-full items-start sm:w-80 gap-3 rounded-card border border-border bg-card p-3 shadow-card-md animate-in fade-in slide-in-from-bottom-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-pill-green-border bg-pill-green-bg text-primary">
        <BellRing className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{message}</p>
        {caseId ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 text-xs"
            onClick={() => {
              markRead(id)
              dismiss(id)
              router.push(caseHref(caseId, step))
            }}
          >
            Open
          </Button>
        ) : null}
      </div>
      <Button type="button" variant="ghost" size="icon" className="!size-6" aria-label="Dismiss" onClick={() => dismiss(id)}>
        <X className="size-3.5" aria-hidden />
      </Button>
    </div>
  )
}

export const DemoToaster = () => {
  const pathname = usePathname()
  const ids = useDemoStore((s) => s.toasts.map((t) => t.id).join(','))
  if (pathname.startsWith('/dashboard/assistant')) return null
  const list = ids ? ids.split(',') : []
  return (
    <div className="pointer-events-none fixed inset-x-3 top-15 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-5" aria-live="polite">
      {list.map((id) => (
        <ToastCard key={id} id={id} />
      ))}
    </div>
  )
}
