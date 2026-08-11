import React, {
  createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo,
} from 'react'
import { windowReducer, initialState } from './windowManager'
import { getApp } from './registry'
import { resolveRoute, buildRoute } from './routes'

const WindowStateContext = createContext(null)
const WindowActionsContext = createContext(null)

/**
 * Deriva estado inicial E rota canônica a partir da URL, sincronamente.
 *
 * Por que não aplicar a URL num efeito: os dois efeitos deste provider rodam no
 * mesmo commit, ambos fechando sobre o state do primeiro render. Se o efeito
 * URL->estado só despachasse OPEN, o efeito estado->URL rodaria em seguida ainda
 * vendo `windows: []`, calcularia '/' e empurraria pushState('/') por cima de uma
 * URL que já estava correta — depois empurraria a rota certa no render seguinte.
 * Duas entradas espúrias no histórico, e o voltar precisando de três cliques.
 */
function deriveInitial() {
  if (typeof window === 'undefined') return { state: initialState, path: '/' }

  const match = resolveRoute(window.location.pathname)
  if (!match) return { state: initialState, path: '/' }

  const app = getApp(match.appId)
  return {
    state: windowReducer(initialState, {
      type: 'OPEN',
      appId: match.appId,
      params: match.params,
      parent: app?.parent,
    }),
    // Forma canônica, não a string crua: '/leia-me/' e '/leia-me' resolvem para
    // o mesmo app, e é a canônica que o efeito estado->URL vai calcular.
    path: buildRoute(match.appId, match.params),
  }
}

export const WindowManagerProvider = ({ children }) => {
  const initial = useMemo(deriveInitial, [])
  const [state, dispatch] = useReducer(windowReducer, initial.state)

  // Última rota conhecida, para não empurrar no histórico a mesma URL que
  // acabamos de ler dele. Nasce coerente com o estado inicial.
  const lastPath = useRef(initial.path)

  const open = useCallback((appId, params = null) => {
    const app = getApp(appId)
    if (!app) return
    // O reducer é puro e não olha o DOM: quem conhece o tamanho da tela e o
    // tamanho padrão do app é esta camada, então os dois viajam na ação. É o que
    // permite a janela nascer centrada sem o reducer perder a testabilidade.
    dispatch({
      type: 'OPEN',
      appId,
      params,
      parent: app.parent,
      size: app.defaultSize,
      viewport:
        typeof window !== 'undefined'
          ? { width: window.innerWidth, height: window.innerHeight }
          : null,
    })
  }, [])

  const close = useCallback((key) => dispatch({ type: 'CLOSE', key }), [])
  const focus = useCallback((key) => dispatch({ type: 'FOCUS', key }), [])
  const minimize = useCallback((key) => dispatch({ type: 'MINIMIZE', key }), [])
  const toggleMaximize = useCallback((key) => dispatch({ type: 'TOGGLE_MAXIMIZE', key }), [])
  const move = useCallback((key, x, y) => dispatch({ type: 'MOVE', key, x, y }), [])
  const minimizeAll = useCallback(() => dispatch({ type: 'MINIMIZE_ALL' }), [])
  const closeAll = useCallback(() => dispatch({ type: 'CLOSE_ALL' }), [])

  // URL -> estado apenas no voltar/avançar. A carga inicial já foi resolvida
  // sincronamente em deriveInitial().
  useEffect(() => {
    const onPopState = () => {
      const match = resolveRoute(window.location.pathname)
      lastPath.current = match ? buildRoute(match.appId, match.params) : '/'

      if (match) {
        const app = getApp(match.appId)
        dispatch({
          type: 'OPEN', appId: match.appId, params: match.params, parent: app?.parent,
        })
      } else {
        dispatch({ type: 'CLOSE_ALL' })
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
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

  /**
   * DOIS CONTEXTOS, NÃO UM.
   *
   * O `value` era montado inline a cada render, então qualquer mudança de estado
   * — focar, arrastar, minimizar — criava um objeto novo e re-renderizava TODOS
   * os consumidores: o Desktop, a Taskbar, cada Window e, por dentro delas, cada
   * app montado. Abrir uma janela re-renderizava todos os apps já abertos.
   *
   * As ações são `useCallback` sem dependências, portanto estáveis para sempre.
   * Separadas, os consumidores que só disparam ações (ProjectsApp, TerminalApp,
   * Dock, HomeScreen, MobileApp) param de re-renderizar por completo quando uma
   * janela se mexe.
   */
  const acoes = useMemo(
    () => ({ open, close, focus, minimize, toggleMaximize, move, minimizeAll, closeAll }),
    [open, close, focus, minimize, toggleMaximize, move, minimizeAll, closeAll],
  )

  const estado = useMemo(
    () => ({ windows: state.windows, focusedKey: state.focusedKey }),
    [state.windows, state.focusedKey],
  )

  return (
    <WindowActionsContext.Provider value={acoes}>
      <WindowStateContext.Provider value={estado}>
        {children}
      </WindowStateContext.Provider>
    </WindowActionsContext.Provider>
  )
}

export function useWindowActions() {
  const ctx = useContext(WindowActionsContext)
  if (!ctx) throw new Error('useWindowActions precisa estar dentro de WindowManagerProvider')
  return ctx
}

// Sem importador hoje — só `useWindows()` (abaixo) o usa, no mesmo arquivo.
// Exportado ainda assim, de propósito: é a metade "estado" da divisão
// estado × ações que é o desenho deste módulo (ver o comentário acima, em
// `acoes`/`estado`). Um app que só precisa ler `windows[]`/`focusedKey` sem
// disparar ações — e portanto não precisa re-renderizar quando só ações
// mudam — depende deste export existir para ganhar o benefício de
// performance descrito ali. Apagá-lo tornaria essa divisão inacessível a
// qualquer consumidor futuro que só use o hook combinado `useWindows()`.
export function useWindowState() {
  const ctx = useContext(WindowStateContext)
  if (!ctx) throw new Error('useWindowState precisa estar dentro de WindowManagerProvider')
  return ctx
}

/** Compatibilidade: quem precisa dos dois. Re-renderiza com o estado, como
 *  antes — use os hooks específicos quando só um lado for necessário. */
export function useWindows() {
  return { ...useWindowState(), ...useWindowActions() }
}
