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

import { JANELAS } from '../config/system'

// Passo da cascata, faixa da barra de tarefas, folga de borda e viés de
// nascimento vêm do config (system.js) — os valores e o porquê de cada um
// estão documentados lá. Nomes locais preservados para o resto do arquivo
// não mudar.
const BASE_X = JANELAS.baseX
const BASE_Y = JANELAS.baseY
const CASCADE_STEP = JANELAS.passoCascata
const CASCADE_WRAP = JANELAS.voltaCascata
const TASKBAR_H = JANELAS.alturaTaskbar
const MARGEM = JANELAS.margem
const VIES_VERTICAL = JANELAS.viesVertical
const VIES_HORIZONTAL = JANELAS.viesHorizontal

const limitar = (v, min, max) => Math.min(Math.max(v, min), max)

// Janelas começam em 101 (a escala reserva 100+ para elas).
export const initialState = {
  windows: [],
  zTop: JANELAS.zInicial,
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

/**
 * CONTRATO DE IDENTIDADE — os `map` daqui para baixo NÃO copiam quem não mudou.
 *
 * Toda transição devolve o MESMO objeto (`return w`, ou o `: w` do ternário)
 * para as janelas não afetadas, e clona só a que mudou. Não é estilo: é o que
 * faz o `React.memo` de `desktop/Window.jsx` valer alguma coisa — ele compara as
 * props por `Object.is`, então focar, minimizar, mover ou maximizar uma janela
 * re-renderiza uma ou duas, e não as N abertas.
 *
 * Trocar isto por cópia total (`{ ...w }` em todo mundo) mataria a memoização
 * SEM NENHUM TESTE FALHAR: o estado resultante é igual campo a campo, que é
 * tudo o que as asserções olham. A regressão seria só de custo de render — e
 * silenciosa. Se mudar algo aqui, o que prova a preservação é comparar
 * referências (`expect(depois.windows[1]).toBe(antes.windows[1])`), não valores.
 *
 * `MINIMIZE_ALL` é a exceção legítima: lá todas as janelas mudam mesmo.
 */
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
