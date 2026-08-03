/**
 * MODO DE DISPOSITIVO
 * --------------------------------------------------
 * Fonte única de verdade sobre desktop vs mobile, substituindo os três
 * useEffect duplicados que o projeto tinha com dois breakpoints diferentes.
 *
 * 1024px porque tablet em retrato não tem espaço para janelas flutuantes.
 * iPad em paisagem (>= 1024) cai em desktop e arrasta por toque de graça,
 * já que o Framer Motion usa pointer events.
 */

import { useState, useEffect } from 'react'

export const DESKTOP_BREAKPOINT = 1024

function currentMode() {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth >= DESKTOP_BREAKPOINT ? 'desktop' : 'mobile'
}

export function useDeviceMode() {
  const [mode, setMode] = useState(currentMode)

  useEffect(() => {
    // matchMedia em vez de listener de resize: dispara só na travessia do
    // breakpoint, não a cada pixel arrastado na borda da janela.
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    const onChange = (e) => setMode(e.matches ? 'desktop' : 'mobile')

    setMode(mq.matches ? 'desktop' : 'mobile')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mode
}
