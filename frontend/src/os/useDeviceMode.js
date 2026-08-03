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

// A media query é a única forma de ler o breakpoint, tanto no valor inicial
// quanto no listener. Ler innerWidth aqui e matchMedia lá divergiria pela
// largura da barra de rolagem em navegadores que a contam na viewport.
const DESKTOP_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}px)`

function currentMode() {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia(DESKTOP_QUERY).matches ? 'desktop' : 'mobile'
}

export function useDeviceMode() {
  const [mode, setMode] = useState(currentMode)

  useEffect(() => {
    // matchMedia em vez de listener de resize: dispara só na travessia do
    // breakpoint, não a cada pixel arrastado na borda da janela.
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e) => setMode(e.matches ? 'desktop' : 'mobile')

    // Sincronia defensiva: cobre a travessia que aconteça entre o primeiro
    // render e o anexo do listener. Sem custo de render quando o valor não
    // muda, porque o React descarta setState com valor idêntico.
    setMode(mq.matches ? 'desktop' : 'mobile')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mode
}
