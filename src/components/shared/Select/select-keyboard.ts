import type { KeyboardEvent } from 'react'
import type { SelectOption } from './select.types'

export const handleSelectKeyDown = (
  event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ctx: SelectKeyboardContext
) => {
  if (ctx.disabled) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!ctx.open) {
        ctx.setActiveIndex(ctx.initialActiveIndex)
        ctx.setOpen(true)
      } else if (ctx.selectableOptions.length > 0) {
        ctx.setActiveIndex(Math.min(ctx.effectiveActiveIndex + 1, ctx.selectableOptions.length - 1))
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!ctx.open) {
        ctx.setActiveIndex(ctx.initialActiveIndex)
        ctx.setOpen(true)
      } else if (ctx.selectableOptions.length > 0) {
        ctx.setActiveIndex(Math.max(ctx.effectiveActiveIndex - 1, 0))
      }
      break
    case 'Enter':
      event.preventDefault()
      if (!ctx.open) {
        ctx.setActiveIndex(ctx.initialActiveIndex)
        ctx.setOpen(true)
      } else if (ctx.effectiveActiveIndex >= 0 && ctx.selectableOptions[ctx.effectiveActiveIndex]) {
        ctx.selectValue(ctx.selectableOptions[ctx.effectiveActiveIndex].value)
      }
      break
    case ' ':
      // Allow typing spaces in the search field; only toggle from the trigger.
      if (event.currentTarget instanceof HTMLInputElement) return
      event.preventDefault()
      if (!ctx.open) {
        ctx.setActiveIndex(ctx.initialActiveIndex)
        ctx.setOpen(true)
      } else if (ctx.effectiveActiveIndex >= 0 && ctx.selectableOptions[ctx.effectiveActiveIndex]) {
        ctx.selectValue(ctx.selectableOptions[ctx.effectiveActiveIndex].value)
      }
      break
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      ctx.close()
      break
    case 'Home':
      if (ctx.open) {
        event.preventDefault()
        ctx.setActiveIndex(0)
      }
      break
    case 'End':
      if (ctx.open && ctx.selectableOptions.length > 0) {
        event.preventDefault()
        ctx.setActiveIndex(ctx.selectableOptions.length - 1)
      }
      break
    default:
      break
  }
}

export interface SelectKeyboardContext {
  disabled?: boolean
  open: boolean
  multiple: boolean
  initialActiveIndex: number
  effectiveActiveIndex: number
  selectableOptions: SelectOption[]
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  setActiveIndex: (index: number) => void
  selectValue: (nextValue: string) => void
  close: () => void
}
