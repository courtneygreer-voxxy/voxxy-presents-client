import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'voxxy-theme'
const DASHBOARD_STORAGE_KEY = 'voxxy-dashboard-theme'
const DEFAULT_THEME: Theme = 'dark'
let externalSetTheme: ((theme: Theme) => void) | null = null

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  const activeTheme = window.localStorage.getItem(STORAGE_KEY)
  if (isTheme(activeTheme)) return activeTheme

  const dashboardTheme = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
  if (isTheme(dashboardTheme)) return dashboardTheme

  return DEFAULT_THEME
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function persistActiveTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore quota / private mode
  }
}

function persistDashboardTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DASHBOARD_STORAGE_KEY, theme)
  } catch {
    // ignore quota / private mode
  }
}

function applyTheme(theme: Theme) {
  if (externalSetTheme) {
    externalSetTheme(theme)
    return
  }

  persistActiveTheme(theme)
  if (typeof document !== 'undefined') {
    applyThemeToDocument(theme)
  }
}

export function resetThemePreference() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore quota / private mode
  }
  applyTheme(DEFAULT_THEME)
}

export function restoreDashboardThemePreference() {
  if (typeof window === 'undefined') return
  const storedTheme = window.localStorage.getItem(DASHBOARD_STORAGE_KEY)
  applyTheme(isTheme(storedTheme) ? storedTheme : DEFAULT_THEME)
}

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  setForcedTheme: (theme: Theme | null) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [forcedTheme, setForcedThemeState] = useState<Theme | null>(null)

  // The effective theme is the forced theme if set, otherwise the user preference
  const effectiveTheme = forcedTheme ?? theme

  useLayoutEffect(() => {
    externalSetTheme = setThemeState
    return () => {
      externalSetTheme = null
    }
  }, [])

  useLayoutEffect(() => {
    applyThemeToDocument(effectiveTheme)
    // Only persist when not forced (user preference changes)
    if (forcedTheme === null) {
      persistActiveTheme(effectiveTheme)
    }
  }, [effectiveTheme, forcedTheme])

  const setTheme = useCallback((next: Theme) => {
    persistDashboardTheme(next)
    setThemeState(next)
  }, [])

  const setForcedTheme = useCallback((next: Theme | null) => {
    setForcedThemeState(next)
  }, [])

  const value = useMemo(
    () => ({
      theme: effectiveTheme,
      setTheme,
      setForcedTheme,
    }),
    [effectiveTheme, setTheme, setForcedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
