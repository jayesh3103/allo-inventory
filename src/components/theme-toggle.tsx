'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    // Check current theme on mount
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setTheme('light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setTheme('dark')
    }
  }

  // Prevent hydration mismatch layout shift
  if (!theme) return <div className="w-10 h-10 rounded-full" />

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border shadow-sm transition-colors"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--foreground)'
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        // Sun icon
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM14.928 15.636a1 1 0 01-1.414 0l-.707-.708a1 1 0 011.414-1.414l.707.708a1 1 0 010 1.414zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.708a1 1 0 011.414-1.414l.708.708a1 1 0 010 1.414zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm2.072-4.364a1 1 0 011.414 0l.707.708a1 1 0 01-1.414 1.414l-.707-.708a1 1 0 010-1.414zM10 14a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}
