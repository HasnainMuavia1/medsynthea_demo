'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, CheckCircle2, Circle, Globe, Loader2, Lock, Paperclip, RotateCw } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { randomFrom } from '@/demo/engine'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

export interface PortalField {
  label: string
  value: string
}

interface Phase {
  key: string
  label: string
}

const PHASES: Phase[] = [
  { key: 'open', label: 'Open payer portal' },
  { key: 'login', label: 'Sign in with practice credentials (vault)' },
  { key: 'nav', label: 'Navigate to submission form' },
  { key: 'form', label: 'Fill form fields' },
  { key: 'attach', label: 'Attach documents' },
  { key: 'submit', label: 'Submit and capture confirmation' },
]

const SPEEDS = [1, 2, 4] as const
type Speed = (typeof SPEEDS)[number]

export const WebPortalSubmission = ({
  payerName,
  portalUrl,
  formTitle,
  fields,
  attachments,
  confirmationPrefix,
  onDone,
}: {
  payerName: string
  portalUrl: string
  formTitle: string
  fields: PortalField[]
  attachments: string[]
  confirmationPrefix: string
  onDone: (confirmation: string) => void
}) => {
  const [phase, setPhase] = useState(0)
  const [fieldIndex, setFieldIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [attached, setAttached] = useState(0)
  const [speed, setSpeed] = useState<Speed>(2)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const confirmationId = useMemo(() => `${confirmationPrefix}-${randomFrom('0123456789', 9)}`, [confirmationPrefix])

  useEffect(() => {
    if (confirmation) return
    const step = (ms: number) => ms / speed
    let t: number
    const key = PHASES[phase]?.key
    if (key === 'open' || key === 'login' || key === 'nav') {
      t = window.setTimeout(() => setPhase((p) => p + 1), step(key === 'login' ? 1300 : 900))
    } else if (key === 'form') {
      const field = fields[fieldIndex]
      if (!field) {
        t = window.setTimeout(() => setPhase((p) => p + 1), step(300))
      } else if (typed.length < field.value.length) {
        t = window.setTimeout(() => setTyped(field.value.slice(0, typed.length + 3)), step(45))
      } else {
        t = window.setTimeout(() => {
          setFieldIndex((i) => i + 1)
          setTyped('')
        }, step(220))
      }
    } else if (key === 'attach') {
      t = window.setTimeout(() => (attached < attachments.length ? setAttached((a) => a + 1) : setPhase((p) => p + 1)), step(650))
    } else {
      t = window.setTimeout(() => {
        setConfirmation(confirmationId)
        doneRef.current(confirmationId)
      }, step(1200))
    }
    return () => window.clearTimeout(t)
  }, [phase, fieldIndex, typed, attached, speed, fields, attachments.length, confirmation, confirmationId])

  const key = PHASES[phase]?.key ?? 'submit'
  const fieldValue = (i: number) => (i < fieldIndex ? fields[i].value : i === fieldIndex && key === 'form' ? typed : '')

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,16rem)] gap-3">
      <div className="overflow-hidden rounded-card border border-border bg-card shadow-card-sm">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-3 py-2">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-warning/60" />
            <span className="size-2.5 rounded-full bg-primary/60" />
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-mono text-2xs text-muted-foreground">
            <Lock className="size-3 shrink-0 text-primary" aria-hidden />
            <span className="truncate">https://{portalUrl}/{key === 'login' || key === 'open' ? 'login' : 'submissions/new'}</span>
          </div>
          {confirmation ? null : <RotateCw className="size-3.5 animate-spin text-muted-foreground" aria-hidden />}
        </div>
        <div className="min-h-72 p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <Globe className="size-4 text-primary" aria-hidden />
            <span className="text-sm font-bold text-foreground">{payerName} Provider Portal</span>
          </div>
          {key === 'open' ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading portal…
            </div>
          ) : key === 'login' ? (
            <div className="mx-auto flex max-w-xs flex-col gap-2">
              <div className="text-sm font-semibold text-foreground">Provider sign in</div>
              <div className={cn(ui.form.input, 'flex items-center')}>lakeside-billing</div>
              <div className={cn(ui.form.input, 'flex items-center tracking-widest')}>••••••••••</div>
              <div className="rounded-md bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground">Signing in · MFA via vault…</div>
            </div>
          ) : key === 'nav' ? (
            <div className="flex flex-col gap-2 text-sm">
              {['Eligibility & benefits', 'Claims & attachments', 'Authorizations & referrals'].map((m) => (
                <div key={m} className={cn('rounded-md border px-3 py-2', formTitle.toLowerCase().includes(m.split(' ')[0].toLowerCase()) ? ui.tone.green : 'border-border text-muted-foreground')}>
                  {m}
                </div>
              ))}
            </div>
          ) : confirmation ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <CheckCircle2 className="size-8 text-primary" aria-hidden />
              <div className="text-sm font-semibold text-foreground">Submission received</div>
              <div className="font-mono text-xs text-muted-foreground">Confirmation # {confirmation}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold text-foreground">{formTitle}</div>
              <div className="grid grid-cols-2 gap-2.5">
                {fields.map((f, i) => (
                  <label key={f.label} className="flex min-w-0 flex-col gap-1">
                    <span className={ui.typography.label}>{f.label}</span>
                    <span className={cn(ui.form.input, 'flex items-center truncate', i === fieldIndex && key === 'form' && 'border-primary ring-2 ring-primary/15')}>
                      {fieldValue(i)}
                      {i === fieldIndex && key === 'form' ? <span className="ml-0.5 h-4 w-px animate-pulse bg-foreground" /> : null}
                    </span>
                  </label>
                ))}
              </div>
              {attachments.length ? (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((a, i) => (
                    <span key={a} className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-1 text-2xs', i < attached ? ui.tone.green : 'border-dashed border-border text-muted-foreground')}>
                      <Paperclip className="size-3" aria-hidden />
                      {a}
                    </span>
                  ))}
                </div>
              ) : null}
              {key === 'submit' ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Submitting…
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div className={cn(ui.surface.card, 'flex flex-col gap-3 p-3')}>
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Bot className="size-4 text-primary" aria-hidden />
          Web submission bot
        </div>
        <ol className="flex flex-col gap-1.5">
          {PHASES.map((p, i) => {
            const done = i < phase || Boolean(confirmation)
            const active = i === phase && !confirmation
            return (
              <li key={p.key} className={cn('flex items-center gap-2 text-xs', done ? 'text-foreground' : active ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                {done ? <CheckCircle2 className="size-3.5 text-primary" aria-hidden /> : active ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Circle className="size-3.5" aria-hidden />}
                {p.label}
              </li>
            )
          })}
        </ol>
        <div className="mt-auto flex items-center gap-1">
          <span className="text-2xs text-muted-foreground">Speed</span>
          {SPEEDS.map((s) => (
            <Button key={s} type="button" size="sm" variant={s === speed ? 'primary' : 'outline'} className="h-6 px-2 text-2xs" onClick={() => setSpeed(s)}>
              {s}×
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
