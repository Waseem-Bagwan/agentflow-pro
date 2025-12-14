import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null
    if (saved !== null) return saved === 'true'
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  return { isDark, toggleDark: () => setIsDark((prev) => !prev) }
}

