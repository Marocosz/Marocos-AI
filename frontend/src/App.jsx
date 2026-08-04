import React from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { WindowManagerProvider } from './os/WindowManagerContext'
import Desktop from './os/desktop/Desktop'
import Taskbar from './os/desktop/Taskbar'
import './os/tokens.css'

/**
 * Shell do NoiseOS.
 *
 * O Lenis saiu junto com o scroll de página: não há mais o que suavizar,
 * porque todo scroll agora acontece dentro de janelas.
 *
 * O shell mobile chega na Fase 3; até lá o mobile recebe o mesmo desktop.
 */
const Shell = () => {
  const { isDark, isAnimated } = useTheme()

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      <WindowManagerProvider>
        <Desktop isAnimated={isAnimated} />
        <Taskbar />
      </WindowManagerProvider>
    </div>
  )
}

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  </LanguageProvider>
)

export default App
