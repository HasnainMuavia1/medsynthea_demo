'use client'

import {
  createContext,
  useContext,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils'

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

const useTabsContext = (): TabsContextValue => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

export const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('flex flex-col gap-3', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ className, children, ...props }: TabsListProps) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex flex-wrap gap-1 rounded-lg border border-border bg-secondary/40 p-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const TabsTrigger = ({ value, children, className, disabled }: TabsTriggerProps) => {
  const { value: selected, onValueChange } = useTabsContext()
  const isSelected = selected === value

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const list = event.currentTarget.closest('[role="tablist"]')
    if (!list) return
    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'))
    const index = tabs.indexOf(event.currentTarget)
    if (index < 0) return
    const next =
      event.key === 'ArrowRight'
        ? tabs[(index + 1) % tabs.length]
        : tabs[(index - 1 + tabs.length) % tabs.length]
    next?.focus()
    const nextValue = next?.dataset.value
    if (nextValue) onValueChange(nextValue)
  }

  return (
    <Button
      type="button"
      role="tab"
      variant="unstyled"
      size="auto"
      disabled={disabled}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      data-value={value}
      onClick={() => onValueChange(value)}
      onKeyDown={onKeyDown}
      className={cn(
        'inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isSelected
          ? 'border-primary/30 bg-primary/10 font-semibold text-primary shadow-sm'
          : 'border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground',
        className
      )}
    >
      {children}
    </Button>
  )
}

export const TabsContent = ({ value, className, children, ...props }: TabsContentProps) => {
  const { value: selected } = useTabsContext()
  if (selected !== value) return null
  return (
    <div role="tabpanel" className={cn('min-w-0', className)} {...props}>
      {children}
    </div>
  )
}

export interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string
}

export interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string
}
