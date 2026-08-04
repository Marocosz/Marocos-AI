import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ThemeContext = createContext(null)

function readBool(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => readBool('isDarkMode', true))
  const [isAnimated, setIsAnimated] = useState(() => readBool('isAnimationEnabled', true))

  // Respeitar a preferência do sistema não existia no projeto e é
  // requisito do spec: sem isto o wallpaper e o boot animam à força.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) setIsAnimated(false)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      localStorage.setItem('isDarkMode', JSON.stringify(!prev))
      return !prev
    })
  }, [])

  const toggleAnimation = useCallback(() => {
    setIsAnimated((prev) => {
      localStorage.setItem('isAnimationEnabled', JSON.stringify(!prev))
      return !prev
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, isAnimated, toggleTheme, toggleAnimation }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider')
  return ctx
}
