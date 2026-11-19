import { Search } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { ui } from '@/styles/ui'

export const SelectSearch = ({
  id,
  value,
  placeholder,
  onChange,
  onKeyDown,
}: SelectSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus without scrolling the page — native autoFocus scrolls ancestors into view,
  // which races useDropdownMenu's scroll-to-close listener on first open.
  useLayoutEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <li role="presentation" className="sticky top-0 z-1 border-b border-border bg-card p-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className={ui.form.searchInput}
        />
      </div>
    </li>
  )
}

export type SelectSearchProps = {
  id: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}
