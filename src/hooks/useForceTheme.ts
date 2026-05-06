import { useEffect } from 'react'
import { useTheme, type Theme } from '@/contexts/ThemeContext'

/**
 * Forces a specific theme while the component is mounted.
 * Restores the user's preference when the component unmounts.
 * Used on public/vendor-facing pages to always show dark mode.
 */
export function useForceTheme(theme: Theme) {
  const { setForcedTheme } = useTheme()

  useEffect(() => {
    setForcedTheme(theme)
    return () => {
      setForcedTheme(null)
    }
  }, [theme, setForcedTheme])
}
