import { useEffect } from 'react'

/** Keeps CSS vars in sync with the real device viewport (handles mobile browser chrome). */
export function useViewportSize(): void {
  useEffect(() => {
    const sync = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const root = document.documentElement
      root.style.setProperty('--app-w', `${width}px`)
      root.style.setProperty('--app-h', `${height}px`)
      root.style.setProperty('--app-vmin', `${Math.min(width, height)}px`)
      root.style.setProperty('--app-vmax', `${Math.max(width, height)}px`)
    }

    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    // iOS address-bar show/hide
    window.visualViewport?.addEventListener('resize', sync)

    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.visualViewport?.removeEventListener('resize', sync)
    }
  }, [])
}
