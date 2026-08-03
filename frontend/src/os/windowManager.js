/**
 * REDUCER DO GERENCIADOR DE JANELAS
 * --------------------------------------------------
 * Fonte única de verdade sobre quais janelas estão abertas, qual tem foco
 * e em que ordem elas se sobrepõem.
 *
 * Deliberadamente puro (zero React, zero DOM) porque é aqui que os bugs
 * moram: herança de foco ao fechar, z-order após N cliques, instância
 * dupla. Lógica pura é lógica testável.
 *
 * NÃO guarda tamanho de janela — tamanho vem do registry em tempo de
 * render, então mudar um defaultSize não invalida estado salvo.
 */

// Posição da primeira janela e passo da cascata.
const BASE_X = 96
const BASE_Y = 64
const CASCADE_STEP = 24
const CASCADE_WRAP = 240

// Janelas começam em 101 (a escala reserva 100+ para elas).
export const initialState = {
  windows: [],
  zTop: 100,
  focusedKey: null,
}

/**
 * Identidade de uma janela. Singletons usam o próprio appId; instâncias
 * dinâmicas ganham sufixo, o que torna "já está aberto?" uma comparação
 * de string.
 */
export function makeKey(appId, params) {
  if (params && params.slug) return `${appId}:${params.slug}`
  return appId
}

/** Desloca cada janela nova para que a anterior não fique escondida. */
export function cascadePosition(n) {
  const offset = (CASCADE_STEP * n) % CASCADE_WRAP
  return { x: BASE_X + offset, y: BASE_Y + offset }
}

/** Janela visível de maior z — quem herda o foco. */
function topmostVisible(windows) {
  const visible = windows.filter((w) => !w.minimized)
  if (visible.length === 0) return null
  return visible.reduce((top, w) => (w.z > top.z ? w : top)).key
}

function raise(state, key) {
  const z = state.zTop + 1
  return {
    ...state,
    windows: state.windows.map((w) => (w.key === key ? { ...w, z, minimized: false } : w)),
    zTop: z,
    focusedKey: key,
  }
}

export function windowReducer(state, action) {
  switch (action.type) {
    case 'OPEN': {
      const { appId, params = null } = action
      const key = makeKey(appId, params)

      // Já aberto: foca em vez de duplicar.
      if (state.windows.some((w) => w.key === key)) return raise(state, key)

      const z = state.zTop + 1
      const { x, y } = cascadePosition(state.windows.length)

      return {
        ...state,
        windows: [
          ...state.windows,
          { key, appId, params, x, y, z, minimized: false, maximized: false, prevPos: null },
        ],
        zTop: z,
        focusedKey: key,
      }
    }

    case 'CLOSE': {
      if (!state.windows.some((w) => w.key === action.key)) return state

      const windows = state.windows.filter((w) => w.key !== action.key)
      const focusedKey =
        state.focusedKey === action.key ? topmostVisible(windows) : state.focusedKey

      return { ...state, windows, focusedKey }
    }

    default:
      return state
  }
}
