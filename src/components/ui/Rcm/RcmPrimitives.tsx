'use client'

import { Button } from '@/components/shared/Button'
import { Badge, type BadgeDensity, type BadgeTone } from '@/components/shared/Badge'
import { cn } from '@/utils'

interface RcmBadgeProps {
  children: React.ReactNode
  tone?: BadgeTone
  density?: BadgeDensity
  dot?: boolean
  className?: string
}

export const RcmBadge = ({
  children,
  tone = 'gray',
  density = 'default',
  dot,
  className,
}: RcmBadgeProps) => {
  return (
    <Badge tone={tone} density={density} dot={dot} className={className}>
      {children}
    </Badge>
  )
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}

export const RcmSegmented = <T extends string>({ value, onChange, options }: SegmentedProps<T>) => {
  return (
    <div className="inline-flex p-0.5 bg-secondary rounded-md border border-border gap-0.5">
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          variant="unstyled"
          size="auto"
          onClick={() => onChange(o.value)}
          className={cn(
            'h-6 rounded px-2.5 text-xs font-medium',
            value === o.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {o.label}
        </Button>
      ))}
    </div>
  )
}

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
}

export const Sparkline = ({ data, color = 'var(--primary)', height = 28 }: SparklineProps) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const w = 100
  const h = 28
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2,
  ])
  const d = pts
    .map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2))
    .join(' ')
  const fillD = d + ` L ${w} ${h} L 0 ${h} Z`

  return (
    <svg
      className="block w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      <path d={fillD} fill={color} opacity={0.1} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface ScoreRingProps {
  value: number
  size?: number
}

export const ScoreRing = ({ value, size = 44 }: ScoreRingProps) => {
  const sw = 4
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const dash = (pct / 100) * c
  const color =
    value >= 85
      ? 'text-primary'
      : value >= 70
        ? 'text-primary'
        : value >= 55
          ? 'text-warning'
          : 'text-destructive'
  const stroke =
    value >= 85
      ? 'var(--primary)'
      : value >= 70
        ? 'var(--primary)'
        : value >= 55
          ? 'var(--warning)'
          : 'var(--destructive)'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold',
          color
        )}
      >
        {value}
      </div>
    </div>
  )
}

export const RcmAvatar = ({ name, className }: { name: string; className?: string }) => {
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full border border-border bg-muted text-2xs font-semibold uppercase shrink-0 text-muted-foreground',
        className
      )}
    >
      {initials}
    </span>
  )
}

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaTone?: 'up' | 'down' | 'flat'
  sparkData?: number[]
  icon: React.ReactNode
  hint?: string
  onClick?: () => void
}

export const KpiCard = ({
  label,
  value,
  delta,
  deltaTone = 'up',
  sparkData,
  icon,
  hint,
  onClick,
}: KpiCardProps) => {
  const deltaToneClass = deltaTone === 'up' ? 'green' : deltaTone === 'down' ? 'red' : 'gray'

  return (
    <Button
      type="button"
      variant="unstyled"
      size="auto"
      onClick={onClick}
      className={cn(
        'flex h-auto min-w-0 flex-col items-stretch gap-2 rounded-card border border-border bg-card p-fluid-card text-left font-normal whitespace-normal',
        onClick && 'cursor-pointer hover:border-border hover:shadow-sm'
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <span className="text-xs text-muted-foreground font-medium truncate">{label}</span>
      </div>
      <div className="font-mono text-4xl font-medium tracking-tight tabular-nums">{value}</div>
      {sparkData && <Sparkline data={sparkData} />}
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        {hint && (
          <span className="line-clamp-2 min-w-0 text-2xs text-muted-foreground" title={hint}>
            {hint}
          </span>
        )}
        {delta && (
          <RcmBadge
            tone={deltaToneClass as BadgeTone}
            density="fit"
            className="shrink-0 text-2xs h-4"
          >
            {deltaTone === 'up' ? '▲' : deltaTone === 'down' ? '▼' : '—'} {delta}
          </RcmBadge>
        )}
      </div>
    </Button>
  )
}
