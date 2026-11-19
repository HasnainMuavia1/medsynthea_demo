'use client'

import {
  createContext,
  useContext,
  useLayoutEffect,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  preference: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

const THEME_ENABLED_PREFIX = '/dashboard'
export const DEFAULT_THEME_STORAGE_KEY = 'app-color-scheme'
const LEGACY_THEME_STORAGE_KEY = 'medsynthea-color-scheme'

const preferenceListeners = new Set<() => void>()

const emitPreferenceChange = () => {
  preferenceListeners.forEach((listener) => listener())
}

export const isThemeEnabledPath = (pathname?: string | null): boolean => {
  if (!pathname) return false
  return pathname === THEME_ENABLED_PREFIX || pathname.startsWith(`${THEME_ENABLED_PREFIX}/`)
}

const readStoredPreference = (storageKey: string, defaultTheme: Theme): Theme => {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'dark' || stored === 'light') return stored
    if (storageKey === DEFAULT_THEME_STORAGE_KEY) {
      const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY)
      if (legacy === 'dark' || legacy === 'light') {
        localStorage.setItem(storageKey, legacy)
        localStorage.removeItem(LEGACY_THEME_STORAGE_KEY)
        return legacy
      }
    }
  } catch {
    // private mode / blocked storage
  }
  return defaultTheme
}

const subscribePreference = (storageKey: string, onStoreChange: () => void) => {
  preferenceListeners.add(onStoreChange)
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) onStoreChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    preferenceListeners.delete(onStoreChange)
    window.removeEventListener('storage', onStorage)
  }
}

const readAppliedTheme = (): Theme => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

const applyThemeClass = (theme: Theme) => {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

const applyThemeInstant = (theme: Theme) => {
  if (readAppliedTheme() === theme && document.documentElement.style.colorScheme === theme) {
    return
  }
  const root = document.documentElement
  root.classList.add('no-transition')
  applyThemeClass(theme)
  // Force style recalc so transitions stay suppressed for this flip.
  void root.offsetHeight
  root.classList.remove('no-transition')
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'light',
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  ...props
}: ThemeProviderProps) => {
  const pathname = usePathname()
  const themeEnabled = isThemeEnabledPath(pathname)

  const preference = useSyncExternalStore(
    (onStoreChange) => subscribePreference(storageKey, onStoreChange),
    () => readStoredPreference(storageKey, defaultTheme),
    () => defaultTheme
  )

  const theme: Theme = themeEnabled ? preference : 'light'

  useLayoutEffect(() => {
    applyThemeInstant(theme)
  }, [theme])

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        localStorage.setItem(storageKey, next)
        if (storageKey === DEFAULT_THEME_STORAGE_KEY) {
          localStorage.removeItem(LEGACY_THEME_STORAGE_KEY)
        }
      } catch {
        // ignore
      }
      // Update DOM before React re-renders so the first paint matches preference.
      if (isThemeEnabledPath(window.location.pathname)) {
        applyThemeInstant(next)
      }
      emitPreferenceChange()
    },
    [storageKey]
  )

  const toggleTheme = useCallback(() => {
    setTheme(preference === 'dark' ? 'light' : 'dark')
  }, [preference, setTheme])

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, preference, setTheme, toggleTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export type Theme = 'dark' | 'light'
