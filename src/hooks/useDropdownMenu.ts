import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

const VIEWPORT_PADDING = 8
/** Matches Select listbox `max-h-72` (18rem). */
const MENU_MAX_HEIGHT_PX = 288
const MENU_MIN_HEIGHT_PX = 48

interface UseDropdownMenuProps {
  open: boolean
  onClose: () => void
  containerRef: RefObject<HTMLElement | null>
  listboxRef: RefObject<HTMLElement | null>
  offset?: number
  zIndex?: number
  minWidth?: number
}

export const useDropdownMenu = ({
  open,
  onClose,
  containerRef,
  listboxRef,
  offset = 4,
  zIndex = 10050,
  minWidth = 88,
}: UseDropdownMenuProps) => {
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})

  const updateMenuPosition = useCallback(() => {
    const trigger = containerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const width = Math.max(rect.width, minWidth)
    const left = Math.min(
      Math.max(VIEWPORT_PADDING, rect.left),
      Math.max(VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING)
    )

    const spaceBelow = window.innerHeight - rect.bottom - offset - VIEWPORT_PADDING
    const spaceAbove = rect.top - offset - VIEWPORT_PADDING

    const listbox = listboxRef.current
    const contentHeight = listbox?.scrollHeight ?? MENU_MAX_HEIGHT_PX
    const desiredHeight = Math.min(MENU_MAX_HEIGHT_PX, contentHeight)

    const openUpward = spaceBelow < desiredHeight && spaceAbove > spaceBelow
    const available = openUpward ? spaceAbove : spaceBelow
    const maxHeight = Math.max(MENU_MIN_HEIGHT_PX, Math.min(MENU_MAX_HEIGHT_PX, available))

    if (openUpward) {
      setMenuStyle({
        position: 'fixed',
        top: 'auto',
        bottom: window.innerHeight - rect.top + offset,
        left,
        width,
        minWidth: width,
        maxHeight,
        zIndex,
      })
      return
    }

    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + offset,
      bottom: 'auto',
      left,
      width,
      minWidth: width,
      maxHeight,
      zIndex,
    })
  }, [containerRef, listboxRef, offset, zIndex, minWidth])

  useLayoutEffect(() => {
    if (!open) return
    updateMenuPosition()
    // Remeasure after portal listbox mounts so scrollHeight / flip are accurate.
    const frameId = window.requestAnimationFrame(() => updateMenuPosition())

    window.addEventListener('resize', updateMenuPosition)
    const handleScroll = (event: Event) => {
      if (listboxRef.current?.contains(event.target as Node)) return
      onClose()
    }
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, updateMenuPosition, listboxRef, onClose])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (containerRef.current?.contains(target)) return
      if (listboxRef.current?.contains(target)) return
      onClose()
    }

    const timer = window.setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open, onClose, containerRef, listboxRef])

  return { menuStyle }
}
