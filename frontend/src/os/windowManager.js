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

// Passo da cascata, e a posição de partida usada quando não se sabe o tamanho da
// tela (ver cascadePosition).
const BASE_X = 96
const BASE_Y = 64
const CASCADE_STEP = 24
const CASCADE_WRAP = 240

// Faixa que a barra de tarefas ocupa no rodapé, e folga mínima até as bordas.
const TASKBAR_H = 52
const MARGEM = 16

/**
 * Fração da altura livre em que a janela nasce. Centro exato (0.5) deixa a
 * composição baixa demais: a barra de tarefas já pesa embaixo, então o meio
 * ótico da área de trabalho fica acima do meio geométrico.
 */
const VIES_VERTICAL = 0.42

/**
 * Quanto a janela caminha da lateral para o centro. Em 0 ela nasce encostada em
 * BASE_X, como antes; em 1 nasce centrada. Meio termo de propósito: centrada ela
 * cobre os ícones e tira o ar da área de trabalho, e encostada na esquerda ela
 * parece ter escorregado para o canto.
 */
const VIES_HORIZONTAL = 0.5

const limitar = (v, min, max) => Math.min(Math.max(v, min), max)

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

/**
 * Onde uma janela nova nasce. Cada uma se desloca em cascata para não cobrir a
 * anterior.
 *
 * `viewport` e `size` são OPCIONAIS, e é isso que mantém esta função pura: quem
 * sabe o tamanho da tela e o tamanho padrão de cada app é a camada React, que
 * manda os dois na ação. Sem eles a função cai na posição fixa de antes — o que
 * também é o que os testes exercitam quando querem a cascata isolada.
 *
 * Com eles, a primeira janela nasce centrada horizontalmente em vez de encostada
 * na esquerda, e o clamp garante que nem a cascata nem uma tela pequena joguem
 * uma janela para fora do quadro.
 */
export function cascadePosition(n, viewport = null, size = null) {
  const offset = (CASCADE_STEP * n) % CASCADE_WRAP
  if (!viewport || !size) return { x: BASE_X + offset, y: BASE_Y + offset }

  const alturaLivre = viewport.height - TASKBAR_H
  const centroX = (viewport.width - size.w) / 2
  const baseX = BASE_X + (centroX - BASE_X) * VIES_HORIZONTAL
  const baseY = (alturaLivre - size.h) * VIES_VERTICAL

  return {
    x: Math.round(
      limitar(baseX + offset, MARGEM, Math.max(MARGEM, viewport.width - size.w - MARGEM)),
    ),
    y: Math.round(
      limitar(baseY + offset, MARGEM, Math.max(MARGEM, alturaLivre - size.h - MARGEM)),
    ),
  }
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
      const { appId, params = null, parent = null, viewport = null, size = null } = action
      const key = makeKey(appId, params)

      // Já aberto: foca em vez de duplicar.
      if (state.windows.some((w) => w.key === key)) return raise(state, key)

      // Deep link para janela filha precisa do pai atrás dela. Recursão de
      // um nível só — o registry não define netos.
      let base = state
      if (parent && !state.windows.some((w) => w.key === parent)) {
        base = windowReducer(state, { type: 'OPEN', appId: parent })
      }

      const z = base.zTop + 1
      const { x, y } = cascadePosition(base.windows.length, viewport, size)

      return {
        ...base,
        windows: [
          ...base.windows,
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

    case 'FOCUS': {
      if (!state.windows.some((w) => w.key === action.key)) return state
      return raise(state, action.key)
    }

    case 'MINIMIZE': {
      if (!state.windows.some((w) => w.key === action.key)) return state

      const windows = state.windows.map((w) =>
        w.key === action.key ? { ...w, minimized: true } : w,
      )
      const focusedKey =
        state.focusedKey === action.key ? topmostVisible(windows) : state.focusedKey

      return { ...state, windows, focusedKey }
    }

    case 'TOGGLE_MAXIMIZE': {
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.key !== action.key) return w
          // Guarda x/y ao maximizar porque o CSS passa a mandar via inset:0,
          // e sem isso a janela restaurada volta na posição errada.
          if (w.maximized) {
            const { x, y } = w.prevPos || { x: w.x, y: w.y }
            return { ...w, maximized: false, x, y, prevPos: null }
          }
          return { ...w, maximized: true, prevPos: { x: w.x, y: w.y } }
        }),
      }
    }

    case 'MOVE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          // Maximizada não tem posição própria; ignora para não guardar
          // coordenada suja que reapareceria ao restaurar.
          w.key === action.key && !w.maximized ? { ...w, x: action.x, y: action.y } : w,
        ),
      }
    }

    case 'MINIMIZE_ALL': {
      return {
        ...state,
        windows: state.windows.map((w) => ({ ...w, minimized: true })),
        focusedKey: null,
      }
    }

    case 'CLOSE_ALL': {
      return { ...state, windows: [], focusedKey: null }
    }

    default:
      return state
  }
}
