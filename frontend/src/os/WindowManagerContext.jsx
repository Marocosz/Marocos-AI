import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { windowReducer, initialState } from './windowManager'
import { getApp } from './registry'
import { resolveRoute, buildRoute } from './routes'

const WindowContext = createContext(null)

export const WindowManagerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState)

  // Evita empurrar no histórico a mesma URL que acabamos de ler dele.
  const lastPath = useRef(null)

  const open = useCallback((appId, params = null) => {
    const app = getApp(appId)
    if (!app) return
    dispatch({ type: 'OPEN', appId, params, parent: app.parent })
  }, [])

  const close = useCallback((key) => dispatch({ type: 'CLOSE', key }), [])
  const focus = useCallback((key) => dispatch({ type: 'FOCUS', key }), [])
  const minimize = useCallback((key) => dispatch({ type: 'MINIMIZE', key }), [])
  const toggleMaximize = useCallback((key) => dispatch({ type: 'TOGGLE_MAXIMIZE', key }), [])
  const move = useCallback((key, x, y) => dispatch({ type: 'MOVE', key, x, y }), [])
  const minimizeAll = useCallback(() => dispatch({ type: 'MINIMIZE_ALL' }), [])
  const closeAll = useCallback(() => dispatch({ type: 'CLOSE_ALL' }), [])

  // URL -> estado, na carga e no voltar/avançar do navegador.
  useEffect(() => {
    const applyUrl = () => {
      const path = window.location.pathname
      lastPath.current = path
      const match = resolveRoute(path)
      if (match) {
        const app = getApp(match.appId)
        dispatch({ type: 'OPEN', appId: match.appId, params: match.params, parent: app?.parent })
      } else {
        dispatch({ type: 'CLOSE_ALL' })
      }
    }

    applyUrl()
    window.addEventListener('popstate', applyUrl)
    return () => window.removeEventListener('popstate', applyUrl)
  }, [])

  // Estado -> URL. A janela com foco define a rota; sem foco, volta à raiz.
  useEffect(() => {
    const focused = state.windows.find((w) => w.key === state.focusedKey)
    const path = focused ? buildRoute(focused.appId, focused.params) : '/'

    if (path !== lastPath.current) {
      lastPath.current = path
      window.history.pushState({}, '', path)
    }
  }, [state.focusedKey, state.windows])

  const value = {
    windows: state.windows,
    focusedKey: state.focusedKey,
    open, close, focus, minimize, toggleMaximize, move, minimizeAll, closeAll,
  }

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
}

export function useWindows() {
  const ctx = useContext(WindowContext)
  if (!ctx) throw new Error('useWindows precisa estar dentro de WindowManagerProvider')
  return ctx
}
