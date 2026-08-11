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

import { LAYOUT } from '../config/system'
import { useMediaQuery } from './hooks/useMediaQuery'

const DESKTOP_BREAKPOINT = LAYOUT.breakpointDesktop

const CONSULTA_DESKTOP = `(min-width: ${DESKTOP_BREAKPOINT}px)`

export function useDeviceMode() {
  return useMediaQuery(CONSULTA_DESKTOP) ? 'desktop' : 'mobile'
}
