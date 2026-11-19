'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileSearch, Stethoscope, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { SearchField } from '@/components/shared/SearchField'
import { usePopoverDismiss } from '@/hooks/usePopoverDismiss'
import { fullName } from '@/demo/engine'
import { visitTypeById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import { caseHref } from './caseLinks'

interface SearchResult {
  id: string
  icon: LucideIcon
  title: string
  detail: string
  href: string
}

const MAX_RESULTS = 8

export const GlobalSearch = () => {
  const router = useRouter()
  const patients = useDemoStore((s) => s.patients)
  const cases = useDemoStore((s) => s.cases)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const close = useCallback(() => setOpen(false), [])
  usePopoverDismiss(open, close, ref)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const out: SearchResult[] = []
    patients.forEach((p) => {
      if ([fullName(p), p.mrn, p.insurance.memberId, p.phone].some((v) => v.toLowerCase().includes(q))) {
        out.push({ id: p.id, icon: User, title: fullName(p), detail: `${p.mrn} · ${p.insurance.payerName}`, href: `/dashboard/patients/${p.id}` })
      }
    })
    cases.forEach((c) => {
      const p = patients.find((x) => x.id === c.patientId)
      const name = p ? fullName(p) : ''
      if (c.encounterNumber.toLowerCase().includes(q) || (name.toLowerCase().includes(q) && out.length < MAX_RESULTS)) {
        out.push({ id: c.id, icon: Stethoscope, title: `${c.encounterNumber} · ${name}`, detail: visitTypeById(c.appointment.visitType).short, href: caseHref(c.id) })
      }
      const claimIds = [c.claim?.claimId, c.claim?.payerClaimControl, c.era?.checkNumber].filter((v): v is string => Boolean(v))
      if (claimIds.some((v) => v.toLowerCase().includes(q))) {
        out.push({ id: `${c.id}-claim`, icon: FileSearch, title: `${c.claim?.claimId} · ${name}`, detail: c.claim?.payerClaimControl ? `Payer # ${c.claim.payerClaimControl}` : 'Claim', href: caseHref(c.id, 'claim') })
      }
    })
    return out.slice(0, MAX_RESULTS)
  }, [query, patients, cases])

  const go = (href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <div ref={ref} className="relative w-full max-w-80">
      <SearchField
        ref={inputRef}
        value={query}
        placeholder="Search patients, MRN, encounter, claim…  ⌘K"
        aria-label="Search the workspace"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onClear={() => setQuery('')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].href)
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && query.trim().length >= 2 ? (
        <div role="listbox" className="absolute left-0 right-0 top-menu-offset-y z-50 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-lg">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">No matches for “{query}”</div>
          ) : (
            results.map((r) => {
              const Icon = r.icon
              return (
                <Button
                  key={r.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  variant="ghost"
                  className="h-auto w-full justify-start gap-2.5 px-2 py-2 text-left font-normal whitespace-normal active:translate-y-0"
                  onClick={() => go(r.href)}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{r.title}</span>
                    <span className="block truncate text-2xs text-muted-foreground">{r.detail}</span>
                  </span>
                </Button>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}
