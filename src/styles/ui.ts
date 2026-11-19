import { cn } from '@/utils'

const TONE = {
  green: 'border-pill-green-border bg-pill-green-bg text-primary',
  blue: 'border-pill-blue-border bg-pill-blue-bg text-pill-blue-text',
  purple: 'border-pill-purple-border bg-pill-purple-bg text-pill-purple-text',
  orange: 'border-pill-orange-border bg-pill-orange-bg text-pill-orange-text',
  yellow: 'border-pill-yellow-border bg-pill-yellow-bg text-warning',
  red: 'border-pill-red-border bg-pill-red-bg text-destructive',
  gray: 'border-pill-gray-border bg-pill-gray-bg text-pill-gray-text',
} as const

/**
 * Shared Tailwind class recipes (design-system layer).
 *
 * Scale matches Claims Pipeline / RcmPage (`RcmLayout`): compact type,
 * denser spacing, `rounded-card` cards — not oversized marketing heroes.
 *
 * Domain modules (`insuranceUi`, `adminUi`, …) should compose these.
 */
export const ui = {
  layout: {
    page: 'flex flex-col gap-4',
    pageMin: 'flex min-h-0 flex-col gap-4',
    pagePad:
      'animate-in fade-in slide-in-from-bottom-1 duration-200 px-page-pad py-5 pb-16 max-w-full min-w-0 md:px-6',
    pageHeader: 'mb-4 flex flex-wrap items-center justify-between gap-3',
    section: 'space-y-section',
    sectionHeader: 'mb-section flex items-start justify-between gap-3',
    grid: 'gap-3',
    fieldStack: 'flex flex-col gap-1',
    fieldGrid: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
    fieldGrid3: 'grid grid-cols-1 gap-3 sm:grid-cols-3',
    formColumn: 'flex flex-col gap-3',
    dialogForm: 'flex flex-col gap-3',
    dialogSplit: 'grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch',
    /** One-line filter row: fixed-width fields + trailing actions. */
    filterBar: 'flex w-full flex-wrap items-end gap-3',
    /**
     * Applied on the FilterBar row — equal capped field widths (14rem / min 10rem)
     * so sparse bars do not stretch full width. Skips `[data-filter-actions]`.
     */
    filterBarFields:
      '[&>*:not([data-filter-actions])]:w-56 [&>*:not([data-filter-actions])]:min-w-40 [&>*:not([data-filter-actions])]:shrink',
    filterBarActions: 'flex shrink-0 items-end gap-2',
    /** Fixed-width select in a one-line FilterBar (appointments status, etc.). */
    filterFixedSelect: '!w-36 !min-w-36 !max-w-36 shrink-0 basis-auto',
    /** Fixed-width date-range control in a one-line FilterBar. */
    filterFixedDateRange: '!w-52 !min-w-52 !max-w-52 shrink-0 basis-auto',
  },

  typography: {
    heroTitle: 'text-hero font-hero tracking-hero text-foreground capitalize',
    heroDescription: 'mt-0.5 text-section text-muted-foreground',
    sectionTitle: 'text-section font-semibold text-foreground capitalize',
    sectionDescription: 'text-section text-muted-foreground leading-snug max-w-3xl',
    sectionDescriptionSm: 'text-xs leading-snug text-muted-foreground',
    cardTitle: 'text-sm font-semibold text-foreground leading-tight capitalize',
    cardSubtitle: 'mt-0.5 text-xs text-muted-foreground leading-snug',
    label: 'text-xs font-medium text-muted-foreground leading-none capitalize',
    value: 'text-section font-medium text-foreground leading-snug',
    valueLg: 'text-section font-semibold text-foreground leading-snug',
    eyebrow: 'text-eyebrow font-semibold uppercase tracking-wide text-muted-foreground',
    meta: 'shrink-0 whitespace-nowrap text-eyebrow font-semibold uppercase tracking-wide text-muted-foreground',
    metaLoose: 'text-eyebrow font-semibold uppercase tracking-wide text-muted-foreground',
    strong: 'font-semibold text-foreground',
    muted: 'text-muted-foreground',
    monoSlug: 'font-mono text-eyebrow text-muted-foreground leading-snug',
  },

  surface: {
    card: 'overflow-hidden rounded-card border border-border bg-card',
    cardSoft: 'overflow-hidden rounded-card border border-border bg-card',
    cardHeader: 'flex min-h-12 items-center gap-3 border-b border-border bg-secondary/40 px-4 py-3',
    cardBody: 'p-4',
    iconBox:
      'flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground',
    iconBoxLg: cn(
      'flex size-9 shrink-0 items-center justify-center rounded-lg',
      'border border-border bg-secondary/60 text-muted-foreground',
      'transition-colors duration-200 group-hover:border-primary/25 group-hover:bg-primary/10 group-hover:text-primary'
    ),
    iconBoxAccent: cn(
      'flex size-9 shrink-0 items-center justify-center rounded-lg',
      'border border-pill-green-border bg-pill-green-bg text-primary',
      'transition-colors duration-200'
    ),
    calloutIcon:
      'flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary',
    calloutFeatureIcon: cn(
      'flex shrink-0 items-center justify-center self-stretch rounded-card p-3',
      'border border-pill-green-border bg-pill-green-bg text-primary'
    ),
    callout: 'rounded-card border border-dashed border-border bg-secondary/30',
    calloutFeature: 'rounded-card border border-border bg-secondary/40',
    calloutBody: 'flex gap-3 p-4 text-sm leading-relaxed text-muted-foreground',
    calloutFeatureBody: 'flex items-stretch gap-3 p-2',
    calloutFeatureContent: 'min-w-0 flex flex-col justify-center',
    calloutFeatureTitle: 'text-sm font-bold leading-tight text-foreground capitalize',
    calloutFeatureDescription: 'text-xs leading-snug text-muted-foreground',
    modalBackdrop: 'bg-overlay backdrop-blur-sm',
    /** Centered system modal shell height cap. Add `modalPanelScroll` for overflow. */
    modalPanel: 'relative w-full min-h-0 max-h-modal-panel-max',
    /** Whole-panel scroll (AppDialog). Prefer when header/footer use sticky positioning. */
    modalPanelScroll: 'overflow-y-auto overscroll-contain custom-scrollbar',
    formPanel: 'flex h-full min-h-0 flex-col gap-3 rounded-card bg-secondary/20 p-3',
    /** Card shell that wraps a FilterBar on list pages. */
    filterCard: 'mb-3 overflow-hidden rounded-card border border-border bg-card p-4',
    /** Dense scroll region inside admin / EHR panels. */
    panelScroll: 'max-h-panel-scroll overflow-y-auto overscroll-contain custom-scrollbar',
    panelScrollLg: 'max-h-panel-scroll-lg overflow-y-auto overscroll-contain custom-scrollbar',
  },

  form: {
    /** Single-line control height shared with Select (`h-9`). */
    controlCompact: 'box-border h-9 min-h-9 rounded-md px-3 py-0 text-sm leading-normal',
    /** Muted surface for filter selects/inputs sitting on cards. */
    filterControl: 'bg-background/40',
    filterSearchControl: '[&_input]:bg-background/40',
    /** Compact select trigger on a filter card (appointments / encounters). */
    filterSelect: 'bg-card px-2 text-xs',
    /** DatePicker input inside a FilterBar date-range field. */
    filterDateInput: cn(
      'box-border h-9 w-full min-w-0 rounded-md border border-border bg-card pl-9 pr-2',
      'text-xs font-medium text-foreground placeholder:text-foreground',
      'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15'
    ),
    filterDateCalendarButton: 'absolute top-1/2 left-2 size-6 -translate-y-1/2',
    filterDateIcon: 'size-4 text-foreground',
    input: cn(
      'box-border h-9 min-h-9 w-full rounded-md border border-border bg-background px-3 py-0 text-sm font-medium leading-normal text-foreground',
      'transition-colors placeholder:text-muted-foreground/50',
      'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15',
      'disabled:cursor-not-allowed disabled:border-border/70 disabled:bg-muted/50 disabled:text-muted-foreground disabled:opacity-80',
      'disabled:hover:border-border/70 disabled:focus:border-border/70 disabled:focus:ring-0',
      'read-only:cursor-default read-only:bg-muted/40 read-only:text-muted-foreground'
    ),
    /** Multi-line control; base styles match `input` with a usable min height. */
    select: cn(
      'h-9 w-full rounded-md border border-border bg-background px-3 text-sm transition-colors',
      'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15',
      'disabled:cursor-not-allowed disabled:border-border/70 disabled:bg-muted/50 disabled:text-muted-foreground disabled:opacity-80'
    ),
    searchInput: cn(
      'h-9 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-foreground',
      'placeholder:text-muted-foreground outline-none transition-colors',
      'focus:border-primary/50 focus:ring-2 focus:ring-primary/15',
      '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
    ),
    searchInputLg: cn(
      'h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-foreground',
      'placeholder:text-muted-foreground outline-none transition-colors',
      'focus:border-primary/50 focus:ring-2 focus:ring-primary/15',
      '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
    ),
    textarea: cn(
      'min-h-22 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground',
      'transition-colors placeholder:text-muted-foreground/50',
      'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15',
      'disabled:cursor-not-allowed disabled:border-border/70 disabled:bg-muted/50 disabled:text-muted-foreground disabled:opacity-80',
      'disabled:hover:border-border/70 disabled:focus:border-border/70 disabled:focus:ring-0',
      'read-only:cursor-default read-only:bg-muted/40 read-only:text-muted-foreground'
    ),
  },

  feedback: {
    dirtyDot: 'absolute -right-1 -top-1 block size-2 rounded-full bg-warning',
    inlineLink: cn(
      'font-semibold text-foreground underline-offset-2',
      'transition-colors hover:text-primary hover:underline'
    ),
    alertDestructive: cn('rounded-lg border px-3 py-2.5 text-sm', TONE.red),
    partialBadge: cn(
      'inline-flex items-center rounded-full border px-2 py-0.5',
      'text-3xs font-semibold uppercase tracking-wide',
      TONE.green
    ),
    pillGreen: cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5',
      'text-2xs font-semibold uppercase tracking-wide',
      TONE.green
    ),
    pillPurple: cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5',
      'text-2xs font-semibold uppercase tracking-wide',
      TONE.purple
    ),
  },

  /** Capsule palette: the only fill/text/border combos for pills, badges and tinted chips. */
  tone: TONE,

  progress: {
    track: 'h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-secondary/60',
    fill: 'h-full rounded-full bg-primary transition-all duration-300',
    fillWarning: 'h-full rounded-full bg-warning transition-all duration-300',
    fillDestructive: 'h-full rounded-full bg-destructive transition-all duration-300',
  },

  interact: {
    /** Text back link above page titles — pair with Button `variant="link"` `size="sm"`. */
    backLink: 'h-auto min-h-0 px-0 text-muted-foreground',
    expandButton: cn(
      'flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background',
      'text-muted-foreground transition-all duration-200',
      'hover:border-primary/30 hover:bg-primary/5 hover:text-primary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
    ),
    expandButtonQuiet: cn(
      'flex size-8 shrink-0 items-center justify-center rounded-md border border-border',
      'text-muted-foreground transition-all duration-200',
      'hover:border-primary/25 hover:bg-primary/5 hover:text-primary'
    ),
  },

  nav: {
    tabSidebar: {
      rail: 'w-full shrink-0 desktop:w-44',
      title:
        'mb-2 hidden pl-0 text-2xs font-semibold uppercase tracking-wider text-muted-foreground desktop:block',
      list: cn(
        'flex flex-row gap-1.5 overflow-x-auto pb-0.5 pl-0',
        'desktop:flex-col desktop:gap-0.5 desktop:overflow-visible desktop:pb-0',
        '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
      ),
      item: cn(
        'group flex h-9 min-h-9 shrink-0 items-center gap-2 rounded-md border py-1.5 pl-0 pr-2 text-left transition-colors desktop:w-full',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1'
      ),
      itemActive: 'border-transparent bg-card text-foreground shadow-sm',
      itemIdle:
        'border-transparent bg-transparent text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
      iconBox:
        'flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground',
      iconBoxActive: 'border-pill-green-border bg-pill-green-bg text-primary',
      iconBoxIdle: 'group-hover:text-foreground',
      label: 'min-w-0 flex-1 truncate text-xs leading-snug font-medium capitalize',
      labelActive: 'text-foreground',
      labelIdle: 'text-muted-foreground group-hover:text-foreground',
    },
  },
} as const

export type UiRecipes = typeof ui
